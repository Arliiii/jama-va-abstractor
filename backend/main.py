from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File, Form
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import asyncio
import uuid
import json
import os
import time
from datetime import datetime

from speckit.pipeline.scraper import JAMAScraper
from speckit.pipeline.parser import JAMAParser
from speckit.pipeline.summarizer import AISummarizer
from speckit.pipeline.ppt_generator import VAPowerPointGenerator

app = FastAPI(title="JAMA VA Abstractor API", version="1.0.0")

# CORS middleware for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:8081", "https://lovable.dev"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory job storage (use Redis in production)
jobs: Dict[str, Dict[str, Any]] = {}

class JobResponse(BaseModel):
    job_id: str
    status: str
    message: str

class ProcessingStep(BaseModel):
    id: str
    name: str
    status: str  # pending, processing, completed, error
    message: str
    timestamp: Optional[str] = None

class JobStatus(BaseModel):
    job_id: str
    status: str  # started, processing, completed, failed
    steps: List[ProcessingStep]
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    created_at: str
    updated_at: str

@app.get("/")
async def root():
    return {"message": "JAMA VA Abstractor API", "version": "1.0.0", "status": "running"}

@app.post("/api/extract", response_model=JobResponse)
async def extract_article(
    background_tasks: BackgroundTasks,
    url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    """
    Start article extraction process from URL or PDF file
    """
    if not url and not file:
        raise HTTPException(status_code=400, detail="Either URL or file must be provided")
    
    if url and file:
        raise HTTPException(status_code=400, detail="Provide either URL or file, not both")
    
    # Generate unique job ID
    job_id = str(uuid.uuid4())
    timestamp = datetime.now().isoformat()
    
    # Initialize job with processing steps
    initial_steps = [
        ProcessingStep(
            id="scrape",
            name="Scraping Article" if url else "Processing PDF",
            status="pending",
            message="Waiting to start..."
        ),
        ProcessingStep(
            id="parse",
            name="Parsing Content",
            status="pending",
            message="Waiting to start..."
        ),
        ProcessingStep(
            id="summarize",
            name="AI Summarization",
            status="pending",
            message="Waiting to start..."
        ),
        ProcessingStep(
            id="generate",
            name="Creating PowerPoint",
            status="pending",
            message="Waiting to start..."
        )
    ]
    
    # Store job information
    jobs[job_id] = {
        "job_id": job_id,
        "status": "started",
        "steps": [step.model_dump() for step in initial_steps],
        "source": {
            "type": "url" if url else "pdf",
            "url": url,
            "filename": file.filename if file else None
        },
        "result": None,
        "error": None,
        "created_at": timestamp,
        "updated_at": timestamp
    }
    
    # Handle file upload if provided
    if file:
        # Save uploaded file temporarily
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, f"{job_id}_{file.filename}")
        
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        jobs[job_id]["source"]["file_path"] = file_path
    
    # Start background processing
    background_tasks.add_task(process_article_pipeline, job_id)
    
    return JobResponse(
        job_id=job_id,
        status="started",
        message="Processing started successfully"
    )

@app.get("/api/progress/{job_id}")
async def get_progress_stream(job_id: str):
    """
    Server-Sent Events stream for real-time progress updates
    """
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    async def generate_progress():
        try:
            while job_id in jobs:
                job = jobs[job_id]
                # Send current job status as properly formatted SSE
                data = json.dumps(job)
                yield f"data: {data}\n\n"
                
                # Stop streaming if job is completed or failed
                if job["status"] in ["completed", "failed"]:
                    # Send final message and close connection properly
                    yield f"data: {json.dumps({'type': 'close', 'status': job['status']})}\n\n"
                    break
                    
                # Wait before next update
                await asyncio.sleep(1)
        except Exception as e:
            # Send error message and close connection
            error_data = json.dumps({
                'type': 'error',
                'message': f'Stream error: {str(e)}'
            })
            yield f"data: {error_data}\n\n"
    
    return StreamingResponse(
        generate_progress(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Cache-Control",
        }
    )

@app.get("/api/status/{job_id}", response_model=JobStatus)
async def get_job_status(job_id: str):
    """
    Get current job status (alternative to SSE)
    """
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job_data = jobs[job_id]
    return JobStatus(**job_data)

@app.get("/api/download/{job_id}")
async def download_powerpoint(job_id: str):
    """
    Download generated PowerPoint file
    """
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs[job_id]
    
    if job["status"] != "completed":
        raise HTTPException(status_code=400, detail="Job not completed yet")
    
    if not job.get("result") or not job["result"].get("file_path"):
        raise HTTPException(status_code=404, detail="Generated file not found")
    
    file_path = job["result"]["file_path"]
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")
    
    return FileResponse(
        file_path,
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        filename=f"va_abstract_{job_id}.pptx",
        headers={"Content-Disposition": f"attachment; filename=va_abstract_{job_id}.pptx"}
    )

@app.delete("/api/jobs/{job_id}")
async def delete_job(job_id: str):
    """
    Delete job and cleanup files
    """
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs[job_id]
    
    # Cleanup files
    if job["source"].get("file_path") and os.path.exists(job["source"]["file_path"]):
        os.remove(job["source"]["file_path"])
    
    if job.get("result", {}).get("file_path") and os.path.exists(job["result"]["file_path"]):
        os.remove(job["result"]["file_path"])
    
    # Remove job from memory
    del jobs[job_id]
    
    return {"message": "Job deleted successfully"}

async def process_article_pipeline(job_id: str):
    """
    Background task that runs the complete pipeline
    """
    try:
        job = jobs[job_id]
        job["status"] = "processing"
        job["updated_at"] = datetime.now().isoformat()
        
        # Initialize pipeline components
        scraper = JAMAScraper()
        parser = JAMAParser()
        summarizer = AISummarizer()
        ppt_generator = VAPowerPointGenerator()
        
        # Step 1: Scraping/Processing
        await update_step_status(job_id, "scrape", "processing", "Scraping article content...")
        
        if job["source"]["type"] == "url":
            scrape_result = await scraper.scrape_article(job["source"]["url"])
        else:
            # For PDF processing, we'll implement a PDF parser
            scrape_result = await scraper.process_pdf(job["source"]["file_path"])
        
        if not scrape_result.get("success"):
            raise ProcessingError("scrape", scrape_result.get("message", "Scraping failed"))
        
        await update_step_status(job_id, "scrape", "completed", "Article content retrieved successfully")
        
        # Step 2: Parsing
        await update_step_status(job_id, "parse", "processing", "Parsing and extracting information...")
        
        parse_result = parser.parse_content(
            scrape_result.get("content", ""),
            job["source"].get("url", "")
        )
        
        if not parse_result.get("success"):
            raise ProcessingError("parse", parse_result.get("message", "Content parsing failed"))
        
        quality_score = parse_result.get("quality_score", 0)
        await update_step_status(
            job_id, 
            "parse", 
            "completed", 
            f"Content parsed successfully (Quality: {quality_score:.1%})"
        )
        
        # Step 3: Summarization
        await update_step_status(job_id, "summarize", "processing", "AI summarization in progress...")
        
        summary_result = await summarizer.summarize(parse_result["extracted_data"])
        
        if not summary_result.get("success"):
            raise ProcessingError("summarize", summary_result.get("message", "AI summarization failed"))
        
        await update_step_status(job_id, "summarize", "completed", "Content summarized successfully")
        
        # Step 4: PowerPoint Generation
        await update_step_status(job_id, "generate", "processing", "Generating PowerPoint presentation...")
        
        ppt_result = ppt_generator.generate_presentation(
            summary_result["summaries"],
            summary_result.get("medical_icon", "general"),
            job_id
        )
        
        if not ppt_result.get("success"):
            raise ProcessingError("generate", ppt_result.get("message", "PowerPoint generation failed"))
        
        await update_step_status(job_id, "generate", "completed", "PowerPoint generated successfully")
        
        # Mark job as completed
        job["status"] = "completed"
        job["result"] = {
            "summaries": summary_result["summaries"],
            "medical_icon": summary_result.get("medical_icon", "general"),
            "file_path": ppt_result["file_path"],
            "quality_score": quality_score,
            "extracted_data": parse_result["extracted_data"]
        }
        job["updated_at"] = datetime.now().isoformat()
        
    except ProcessingError as e:
        # Handle pipeline step errors
        await update_step_status(job_id, e.step, "error", f"Error: {e.message}")
        job["status"] = "failed"
        job["error"] = f"Pipeline failed at step '{e.step}': {e.message}"
        job["updated_at"] = datetime.now().isoformat()
        
    except Exception as e:
        # Handle unexpected errors
        job["status"] = "failed"
        job["error"] = f"Unexpected error: {str(e)}"
        job["updated_at"] = datetime.now().isoformat()
        
        # Mark current processing step as error
        for step in job["steps"]:
            if step["status"] == "processing":
                step["status"] = "error"
                step["message"] = f"Unexpected error: {str(e)}"
                step["timestamp"] = datetime.now().isoformat()
                break

async def update_step_status(job_id: str, step_id: str, status: str, message: str):
    """Update the status of a specific processing step"""
    if job_id in jobs:
        for step in jobs[job_id]["steps"]:
            if step["id"] == step_id:
                step["status"] = status
                step["message"] = message
                step["timestamp"] = datetime.now().isoformat()
                break
        jobs[job_id]["updated_at"] = datetime.now().isoformat()

class ProcessingError(Exception):
    """Custom exception for pipeline processing errors"""
    def __init__(self, step: str, message: str):
        self.step = step
        self.message = message
        super().__init__(f"Step '{step}' failed: {message}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
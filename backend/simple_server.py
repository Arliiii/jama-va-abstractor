from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uuid
import json
import os
from datetime import datetime

# Simple working FastAPI server for testing
app = FastAPI(title="JAMA VA Abstractor API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8081", "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for jobs
jobs = {}

class JobResponse(BaseModel):
    job_id: str
    status: str
    message: str

@app.get("/")
async def root():
    return {"message": "JAMA VA Abstractor API", "version": "1.0.0", "status": "running"}

@app.post("/api/extract", response_model=JobResponse)
async def extract_article(
    url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    """Start article extraction process"""
    
    if not url and not file:
        raise HTTPException(status_code=400, detail="Either URL or file must be provided")
    
    if url and file:
        raise HTTPException(status_code=400, detail="Provide either URL or file, not both")
    
    # Generate job ID
    job_id = str(uuid.uuid4())
    timestamp = datetime.now().isoformat()
    
    # Initialize job
    jobs[job_id] = {
        "job_id": job_id,
        "status": "started",
        "steps": [
            {"id": "scrape", "name": "Scraping Article", "status": "processing", "message": "Processing input...", "timestamp": timestamp},
            {"id": "parse", "name": "Parsing Content", "status": "pending", "message": "Waiting...", "timestamp": timestamp},
            {"id": "summarize", "name": "AI Summarization", "status": "pending", "message": "Waiting...", "timestamp": timestamp},
            {"id": "generate", "name": "Creating PowerPoint", "status": "pending", "message": "Waiting...", "timestamp": timestamp}
        ],
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
    
    # Simulate processing completion after a delay
    import asyncio
    asyncio.create_task(simulate_processing(job_id))
    
    return JobResponse(
        job_id=job_id,
        status="started",
        message="Processing started successfully"
    )

async def simulate_processing(job_id: str):
    """Simulate the processing pipeline"""
    await asyncio.sleep(2)  # Simulate scraping
    
    if job_id in jobs:
        jobs[job_id]["steps"][0]["status"] = "completed"
        jobs[job_id]["steps"][0]["message"] = "Successfully scraped content"
        jobs[job_id]["steps"][1]["status"] = "processing"
        jobs[job_id]["steps"][1]["message"] = "Parsing content..."
        jobs[job_id]["updated_at"] = datetime.now().isoformat()
    
    await asyncio.sleep(2)  # Simulate parsing
    
    if job_id in jobs:
        jobs[job_id]["steps"][1]["status"] = "completed"
        jobs[job_id]["steps"][1]["message"] = "Successfully parsed content"
        jobs[job_id]["steps"][2]["status"] = "processing"
        jobs[job_id]["steps"][2]["message"] = "Generating AI summary..."
        jobs[job_id]["updated_at"] = datetime.now().isoformat()
    
    await asyncio.sleep(3)  # Simulate AI processing
    
    if job_id in jobs:
        jobs[job_id]["steps"][2]["status"] = "completed"
        jobs[job_id]["steps"][2]["message"] = "Successfully generated summary"
        jobs[job_id]["steps"][3]["status"] = "processing"
        jobs[job_id]["steps"][3]["message"] = "Creating PowerPoint..."
        jobs[job_id]["updated_at"] = datetime.now().isoformat()
    
    await asyncio.sleep(2)  # Simulate PowerPoint generation
    
    if job_id in jobs:
        jobs[job_id]["steps"][3]["status"] = "completed"
        jobs[job_id]["steps"][3]["message"] = "Successfully created PowerPoint"
        jobs[job_id]["status"] = "completed"
        jobs[job_id]["result"] = {
            "title": "Clinical Study of Medical Intervention Effects",
            "population": {
                "size": "1,247 participants",
                "demographics": "Adults aged 45-75, 52% female",
                "criteria": "Diagnosed condition, stable medication regimen"
            },
            "intervention": {
                "treatment": "Novel therapeutic intervention",
                "duration": "12 weeks",
                "control": "Standard care control group"
            },
            "setting": {
                "location": "Multi-center study (15 sites)",
                "type": "Randomized controlled trial",
                "duration": "18-month study period"
            },
            "outcomes": {
                "primary": "Primary efficacy endpoint improvement",
                "secondary": ["Safety measures", "Quality of life", "Biomarkers"],
                "measurements": "Standardized assessment tools"
            },
            "findings": {
                "primary": "Significant improvement in primary endpoint with 32% relative risk reduction (p<0.001)",
                "secondary": "Improved quality of life scores and favorable safety profile",
                "significance": "Clinically meaningful and statistically significant results",
                "limitations": "Single-blind design, limited diversity in study population"
            },
            "medicalIcon": "general_medicine"
        }
        jobs[job_id]["updated_at"] = datetime.now().isoformat()

@app.get("/api/progress/{job_id}")
async def get_progress_stream(job_id: str):
    """Server-Sent Events stream for real-time progress updates"""
    
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    from fastapi.responses import StreamingResponse
    
    async def generate_progress():
        while job_id in jobs:
            job = jobs[job_id]
            # Send current job status as SSE
            yield f"data: {json.dumps(job)}\n\n"
            
            # Stop streaming if job is completed or failed
            if job["status"] in ["completed", "failed"]:
                break
                
            await asyncio.sleep(1)  # Update every second
    
    return StreamingResponse(
        generate_progress(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream"
        }
    )

@app.get("/api/status/{job_id}")
async def get_job_status(job_id: str):
    """Get current job status"""
    
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return jobs[job_id]

@app.get("/api/download/{job_id}")
async def download_powerpoint(job_id: str):
    """Download the generated PowerPoint file"""
    
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs[job_id]
    if job["status"] != "completed":
        raise HTTPException(status_code=400, detail="Job not completed yet")
    
    # For now, return a mock response
    from fastapi.responses import Response
    
    # Mock PowerPoint content
    mock_content = b"Mock PowerPoint file content - this would be a real .pptx file"
    
    return Response(
        content=mock_content,
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        headers={
            "Content-Disposition": f"attachment; filename=va_abstract_{job_id}.pptx"
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
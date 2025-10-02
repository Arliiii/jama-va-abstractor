# JAMA VA Abstractor - Quick Start Guide

## 🚀 Getting Started

This guide will help you set up the complete JAMA VA Abstractor application with both frontend and backend components.

## Prerequisites

- **Node.js 18+** (for frontend)
- **Python 3.8+** (for backend)
- **OpenAI API Key** (for AI summarization)
- **Chrome Browser** (for web scraping)

## Step 1: Backend Setup

### Windows Quick Setup
1. Navigate to the backend directory:
   ```cmd
   cd backend
   ```

2. Run the setup script:
   ```cmd
   start.bat
   ```
   This will:
   - Install Python dependencies
   - Create `.env` file from template
   - Open the `.env` file for you to add your OpenAI API key
   - Start the backend server

### Manual Backend Setup
1. Install Python dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. Create environment file:
   ```bash
   copy .env.example .env
   ```

3. Edit `.env` and add your OpenAI API key:
   ```bash
   OPENAI_API_KEY=sk-your-actual-openai-api-key-here
   ```

4. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```

The backend will be available at: http://localhost:8000

## Step 2: Frontend Setup

1. Open a new terminal and navigate to the project root
2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm run dev
   ```

The frontend will be available at: http://localhost:5173

## Step 3: Test the Application

1. Open your browser to http://localhost:5173
2. Try one of these test cases:

### Test with JAMA URL
- Enter a JAMA article URL like:
  ```
  https://jamanetwork.com/journals/jama/fullarticle/2812685
  ```

### Test with PDF Upload
- Drag and drop a research paper PDF
- Click "Generate VA PowerPoint"

### Watch Real-time Progress
- Monitor the 4-step pipeline:
  1. **Scraping Article** - Extracting content
  2. **Parsing Data** - Identifying key information
  3. **Summarizing Findings** - AI-powered analysis
  4. **Generating PowerPoint** - Creating VA-style presentation

## 🔧 Troubleshooting

### Backend Issues

**OpenAI API Error**
- Verify your API key in `backend/.env`
- Check your OpenAI account has sufficient credits

**Chrome Driver Issues**
- The system auto-downloads ChromeDriver
- Ensure Chrome browser is installed

**Port Already in Use**
- Kill existing processes on port 8000
- Or change port in `backend/.env`

### Frontend Issues

**Build Errors**
- Delete `node_modules` and run `npm install` again
- Ensure Node.js version is 18+

**CORS Errors**
- Verify backend is running on port 8000
- Check FRONTEND_URL in `backend/.env`

## 🎯 Usage Tips

### Best Input Sources
- **JAMA Research Articles**: Primary target, best results
- **Clinical Trial Papers**: Good structured data
- **Systematic Reviews**: Rich content for summarization

### PowerPoint Features
- **VA-Style Branding**: Professional medical presentation format
- **Medical Icons**: Automatically selected based on content
- **Structured Layouts**: Population, Intervention, Outcomes, Findings

### Performance Notes
- **First Run**: May take longer due to Chrome setup
- **Large PDFs**: Processing time increases with file size
- **OpenAI Rate Limits**: May cause delays during high usage

## 📊 API Health Check

Verify backend is working:
```bash
curl http://localhost:8000/health
```

Should return:
```json
{"status": "healthy", "timestamp": "2025-10-02T..."}
```

## 🔐 Security Notes

- Keep your OpenAI API key secure in `.env`
- Don't commit `.env` files to version control
- Monitor API usage to avoid unexpected charges

## 📁 File Structure After Setup

```
jama-va-abstractor/
├── backend/
│   ├── .env                 # Your API keys (do not commit!)
│   ├── uploads/             # Temporary PDF storage
│   ├── output/              # Generated PowerPoint files
│   └── ... (source files)
├── node_modules/            # Frontend dependencies
├── dist/                    # Built frontend (after npm run build)
└── ... (source files)
```

## 🚀 Ready to Go!

Your JAMA VA Abstractor is now ready to:
- ✅ Extract key insights from JAMA articles
- ✅ Generate professional VA-style PowerPoints
- ✅ Provide real-time processing updates
- ✅ Handle both URL and PDF inputs

**Happy abstracting! 🎉**
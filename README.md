# JAMA VA Abstractor

## 🎯 Project Overview
The JAMA VA Abstractor is a web application that streamlines the process of creating VA-style graphical abstracts from JAMA articles. Users can input article URLs or upload PDFs to automatically extract key research components and generate professional PowerPoint presentations.

## ✨ Key Features

### 📊 Data Extraction
- **Population**: Demographics, sample size, participant characteristics
- **Intervention**: Treatment details, duration, control groups
- **Setting**: Study environment, locations, institutions
- **Outcomes**: Primary and secondary endpoints, measurements
- **Findings**: Key results, statistical significance, limitations

### 📝 Input Methods
- **URL Processing**: Direct JAMA article link extraction
- **PDF Upload**: Drag-and-drop file processing with OCR support
- **File Validation**: Type checking, size limits, error handling

### 🎨 PowerPoint Generation
- **Multiple Templates**: Standard, Clinical, Research, Review styles
- **Custom Branding**: Logo integration, color schemes, institution names
- **Professional Layout**: VA-style formatting and design
- **Download Options**: Direct download with expiration management

## 🔧 Development Setup

### Prerequisites
- **Frontend**: Node.js 18+, npm/yarn/pnpm
- **Backend**: Python 3.8+, pip
- **API**: OpenAI API key for AI summarization
- **Browser**: Modern web browser with JavaScript enabled

### Quick Start

#### 1. Backend Setup (Required First)
```bash
# Navigate to backend directory
cd backend

# Windows: Use the automated setup script
start.bat

# Or manual setup:
pip install -r requirements.txt
copy .env.example .env
# Edit .env file and add your OpenAI API key
uvicorn main:app --reload
```

#### 2. Frontend Setup
```bash
# Navigate to project root
cd jama-va-abstractor

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Configuration

#### Backend (.env)
```env
OPENAI_API_KEY=your_openai_api_key_here
HOST=127.0.0.1
PORT=8000
DEBUG=True
```

#### Frontend (automatic)
The frontend automatically connects to `http://localhost:8000` for development.

## 🏗️ Technical Stack

### Frontend
- **React 18+** with TypeScript for type-safe development
- **Vite** for fast development and optimized builds
- **Tailwind CSS** + **shadcn/ui** for modern, responsive styling
- **Server-Sent Events** for real-time progress tracking
- **Custom Hooks** for state management and API integration

### Backend (SpecKit Pipeline)
- **FastAPI** for high-performance async API
- **Selenium + Requests** for robust web scraping
- **BeautifulSoup4** for intelligent HTML parsing  
- **OpenAI API** for AI-powered medical summarization
- **python-pptx** for VA-style PowerPoint generation
- **Server-Sent Events** for real-time progress updates

### Pipeline Architecture
1. **Scraper** → Extract content from JAMA URLs or PDFs
2. **Parser** → Extract structured medical data
3. **Summarizer** → AI-powered summarization with medical context
4. **Generator** → Create VA-branded PowerPoint presentations

## 📁 Project Structure

```
jama-va-abstractor/
├── backend/                        # SpecKit-powered backend
│   ├── main.py                    # FastAPI server with SSE
│   ├── requirements.txt           # Python dependencies
│   ├── start.bat                  # Windows startup script
│   ├── .env.example              # Environment template
│   └── speckit/
│       └── pipeline/              # 4-step processing pipeline
│           ├── scraper.py         # JAMA article extraction
│           ├── parser.py          # Medical data parsing
│           ├── summarizer.py      # AI-powered summarization
│           └── ppt_generator.py   # VA PowerPoint generation
├── src/                           # React frontend
│   ├── components/                # UI components
│   │   ├── ProgressTracker.tsx    # Real-time progress display
│   │   ├── FileUploadZone.tsx     # Drag-and-drop uploads
│   │   └── ui/                    # shadcn/ui components
│   ├── hooks/                     # Custom React hooks
│   │   └── useExtraction.ts       # Backend integration hook
│   ├── pages/                     # Application pages
│   └── types/                     # TypeScript definitions
├── specs/                         # Project specifications
└── package.json                   # Frontend dependencies
```

## 🚀 API Endpoints

### Core Operations
- `POST /process-article` - Start article processing (URL or PDF)
- `GET /job-status/{job_id}` - Check processing job status
- `GET /progress/{job_id}` - Real-time progress stream (SSE)
- `GET /download/{job_id}` - Download generated PowerPoint
- `GET /health` - Backend health check

### Real-time Features
- **Server-Sent Events** for live progress updates
- **Background Processing** with job queue management
- **Error Recovery** with detailed error reporting
- **File Management** with automatic cleanup

## 📚 Documentation

### Available Specifications
- **API Specification**: Complete OpenAPI documentation (`specs/api/jama-abstractor.yaml`)
- **Component Specifications**: Detailed component requirements (`specs/components.md`)
- **Technical Requirements**: System architecture and requirements (`specs/technical-requirements.md`)
- **TypeScript Types**: Complete type definitions (`src/types/api.ts`)

## 🧪 Testing Strategy

### Planned Test Coverage
- **Unit tests** for components and hooks
- **Integration tests** for API endpoints
- **End-to-end tests** for complete workflows
- **Accessibility tests** for compliance

## 🔮 Development Status

### ✅ Completed Features
- **Complete Backend Pipeline**: 4-step SpecKit processing system
- **Real-time Progress Tracking**: Server-Sent Events integration
- **AI-Powered Summarization**: OpenAI integration with medical context
- **VA PowerPoint Generation**: Branded presentation templates
- **Frontend Integration**: React hooks with live progress updates
- **File Upload Support**: Drag-and-drop PDF processing
- **Error Handling**: Robust error recovery at each step

### 🚧 Ready for Testing
- **Environment Setup**: Configure OpenAI API key
- **Backend Testing**: Start server and test endpoints
- **Frontend Testing**: Test complete user workflow
- **Integration Testing**: Verify real-time progress updates

### 🔮 Future Enhancements
- **Batch Processing**: Handle multiple articles simultaneously
- **Template Customization**: Advanced PowerPoint styling options
- **Export Formats**: Additional output formats (Word, PDF)
- **Content Analytics**: Study insights and trending topics

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Create** feature branch
3. **Implement** changes with tests
4. **Submit** pull request
5. **Code review** and merge

### Code Standards
- **TypeScript** for type safety
- **React best practices** for components
- **Accessibility guidelines** compliance
- **Performance optimization** considerations

## 📞 Lovable Integration

This project was initially created with [Lovable](https://lovable.dev/projects/7c0e11a5-33b2-49be-97ec-b67f318641e6).

### Deployment
- Simply open [Lovable](https://lovable.dev/projects/7c0e11a5-33b2-49be-97ec-b67f318641e6) and click on Share → Publish
- Connect a custom domain via Project → Settings → Domains

---

**Ready to extract insights from JAMA articles with ease! 🚀**

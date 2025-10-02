# JAMA VA Abstractor - Technical Requirements

## Project Overview
A web application that extracts key details from JAMA articles (via URL or PDF upload) and generates VA-style graphical abstracts in PowerPoint format.

## Functional Requirements

### Core Features

#### 1. Article Input Methods
- **URL Input**: Accept JAMA article URLs for processing
  - Validate URL format and domain (jamanetwork.com)
  - Handle paywalled content
  - Support various JAMA journal types
- **PDF Upload**: Accept PDF file uploads
  - Support drag-and-drop interface
  - File size limit: 10MB maximum
  - File type validation (.pdf only)
  - Progress indicator during upload

#### 2. Data Extraction
Extract the following key information from articles:
- **Population**: Demographics, sample size, inclusion/exclusion criteria
- **Intervention**: Type, description, duration, control group details
- **Setting**: Clinical/community/home, geographic location, institutions
- **Outcome**: Primary and secondary measures, endpoints, timepoints
- **Findings**: Key results, statistical significance, clinical significance, limitations

#### 3. PowerPoint Generation
- Generate VA-style graphical abstracts
- Multiple template options (Standard, Clinical, Research, Review)
- Custom branding support (logos, colors, institution names)
- Export as .pptx format
- Downloadable with expiration links

#### 4. Data Management
- Save extraction history
- Edit/modify extracted data before PowerPoint generation
- Export extracted data (JSON, CSV formats)
- Search and filter previous extractions

### User Interface Requirements

#### 5. Main Interface
- Clean, intuitive design
- Responsive layout (mobile, tablet, desktop)
- Progress indicators for long operations
- Real-time feedback and error messages
- Accessibility compliance (WCAG 2.1 AA)

#### 6. File Upload Interface
- Drag-and-drop zone
- File validation feedback
- Upload progress visualization
- Error handling for invalid files

#### 7. Results Display
- Organized sections for each data category
- Confidence scores for extracted information
- Editable fields for manual corrections
- Collapsible/expandable sections

## Technical Requirements

### Frontend Stack
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite (already configured)
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API or Zustand
- **HTTP Client**: Axios or Fetch API
- **File Handling**: File API with drag-and-drop support

### Backend Requirements
- **Runtime**: Node.js 18+ or Python 3.9+
- **Framework**: Express.js/Fastify (Node.js) or FastAPI (Python)
- **File Processing**: PDF parsing libraries (pdf-parse, PyPDF2, or pdfplumber)
- **Web Scraping**: Puppeteer/Playwright for URL content extraction
- **PowerPoint Generation**: 
  - Node.js: PptxGenJS or officegen
  - Python: python-pptx
- **Authentication**: JWT-based (optional for MVP)

### Data Processing
- **PDF Text Extraction**: Support OCR for scanned PDFs
- **Natural Language Processing**: 
  - Text parsing and categorization
  - Named Entity Recognition (NER)
  - Classification models for medical/clinical text
- **Content Validation**: Confidence scoring for extracted data
- **Error Handling**: Robust error recovery and user feedback

### Database Requirements
- **Primary Database**: PostgreSQL or MongoDB
- **Caching**: Redis for temporary data and session management
- **File Storage**: 
  - Local filesystem (development)
  - AWS S3 or similar (production)
- **Backup Strategy**: Automated daily backups

## Performance Requirements

### Response Times
- URL processing: < 30 seconds
- PDF processing: < 60 seconds (depending on file size)
- PowerPoint generation: < 15 seconds
- Page load times: < 3 seconds
- API response times: < 2 seconds for simple operations

### Scalability
- Support 100+ concurrent users
- Handle files up to 10MB
- Process 1000+ extractions per day
- Horizontal scaling capability

### Reliability
- 99.5% uptime target
- Graceful error handling
- Data persistence and recovery
- Monitoring and alerting

## Security Requirements

### Data Protection
- HTTPS encryption for all communications
- Input validation and sanitization
- File type and size validation
- Rate limiting to prevent abuse
- CORS configuration for API access

### Privacy
- No persistent storage of uploaded PDFs (optional)
- Anonymization of extracted data
- Compliance with healthcare data regulations
- User consent for data processing

### Authentication (Optional for MVP)
- JWT-based authentication
- Role-based access control
- Session management
- Password security requirements

## Integration Requirements

### External Services
- **JAMA Network Access**: Handle authentication and paywall restrictions
- **AI/ML Services**: For enhanced text extraction and classification
- **Cloud Storage**: For file and generated content storage
- **Monitoring Services**: Application performance monitoring

### API Design
- RESTful API architecture
- OpenAPI/Swagger documentation
- Versioning strategy
- Error response standardization
- Rate limiting implementation

## Development Requirements

### Code Quality
- TypeScript strict mode
- ESLint and Prettier configuration
- Unit test coverage > 80%
- Integration tests for critical paths
- End-to-end tests for user workflows

### Documentation
- API documentation (OpenAPI spec)
- Component documentation
- Deployment guides
- User documentation
- Code comments and inline documentation

### Version Control
- Git-based workflow
- Feature branch strategy
- Code review requirements
- Semantic versioning
- Automated testing on commits

## Deployment Requirements

### Environment Configuration
- **Development**: Local development setup
- **Staging**: Testing environment with production-like data
- **Production**: Scalable, monitored production environment

### Infrastructure
- **Containerization**: Docker for consistent deployment
- **Orchestration**: Docker Compose (simple) or Kubernetes (complex)
- **Reverse Proxy**: Nginx for load balancing and SSL termination
- **Process Management**: PM2 or similar for Node.js applications

### Monitoring and Logging
- **Application Monitoring**: Error tracking and performance monitoring
- **Server Monitoring**: CPU, memory, disk usage tracking
- **Log Management**: Centralized logging with retention policies
- **Health Checks**: Automated health monitoring and alerting

## Browser Compatibility
- **Primary Support**: Chrome 90+, Firefox 90+, Safari 14+, Edge 90+
- **Mobile Support**: iOS Safari 14+, Chrome Mobile 90+
- **Accessibility**: Screen reader compatibility, keyboard navigation

## Compliance and Standards
- **Medical Data**: HIPAA considerations for healthcare data
- **Accessibility**: WCAG 2.1 AA compliance
- **Data Privacy**: GDPR compliance for EU users
- **Code Standards**: Industry best practices for security and performance

## Future Enhancements (Post-MVP)
- **Multi-language Support**: Support for non-English articles
- **Batch Processing**: Upload and process multiple files
- **Advanced Templates**: More PowerPoint template options
- **Collaboration Features**: Share and collaborate on extractions
- **API Access**: Public API for third-party integrations
- **Mobile App**: Native mobile application
- **Advanced Analytics**: Usage analytics and insights

## Success Metrics
- **User Engagement**: Daily active users, extraction completion rate
- **Performance**: Average processing time, success rate
- **Quality**: User satisfaction scores, accuracy of extractions
- **Technical**: System uptime, error rates, response times

This technical specification provides a comprehensive foundation for building a robust, scalable JAMA VA Abstractor application that meets both functional and technical requirements while ensuring good user experience and maintainability.
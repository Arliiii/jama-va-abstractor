# JAMA VA Abstractor - Component Specifications

## Overview
This document outlines the component specifications for the JAMA VA Abstractor web application, which allows users to extract key details from JAMA articles and generate VA-style PowerPoint abstracts.

## Core Components

### 1. FileUploadZone Component
**Purpose**: Handles PDF file uploads with drag-and-drop functionality

**Props**:
- `onFileSelect: (file: File) => void` - Callback when file is selected
- `acceptedTypes: string[]` - Allowed file types (default: ['.pdf'])
- `maxSize: number` - Maximum file size in bytes (default: 10MB)
- `disabled?: boolean` - Whether upload is disabled

**Features**:
- Drag and drop interface
- File validation (type, size)
- Progress indicator during upload
- Error handling for invalid files
- Visual feedback for drag states

**State**:
- `isDragOver: boolean` - Tracks drag state
- `isUploading: boolean` - Tracks upload progress
- `error: string | null` - Upload errors

### 2. UrlInput Component
**Purpose**: Accepts JAMA article URLs for processing

**Props**:
- `onUrlSubmit: (url: string) => void` - Callback when URL is submitted
- `disabled?: boolean` - Whether input is disabled
- `placeholder?: string` - Input placeholder text

**Features**:
- URL validation (JAMA domain check)
- Auto-format URLs
- Loading state during processing
- Error display for invalid URLs

**Validation Rules**:
- Must be valid URL format
- Must be from jamanetwork.com domain
- Must be accessible article URL

### 3. ExtractionResults Component
**Purpose**: Displays extracted article data in organized sections

**Props**:
- `extraction: ArticleExtraction` - Extracted article data
- `onGenerateAbstract: () => void` - Callback to generate PowerPoint
- `onEdit: () => void` - Callback to edit extracted data

**Sections**:
- **Article Info**: Title, authors, journal, publication date
- **Population**: Demographics, sample size, description
- **Intervention**: Type, description, duration, control
- **Setting**: Type, location, institutions
- **Outcomes**: Primary and secondary measures
- **Findings**: Key results, significance, limitations

**Features**:
- Collapsible sections
- Confidence scores display
- Edit functionality for manual corrections
- Export options (JSON, CSV)

### 4. PowerPointGenerator Component
**Purpose**: Handles PowerPoint abstract generation

**Props**:
- `extractionId: string` - ID of extraction to use
- `template: TemplateType` - PowerPoint template style
- `branding?: BrandingOptions` - Custom branding options
- `onGenerated: (response: GenerateAbstractResponse) => void` - Success callback

**Features**:
- Template selection (Standard, Clinical, Research, Review)
- Custom branding options (logo, colors, institution)
- Progress tracking during generation
- Download link with expiration
- Preview option (if supported)

**Templates**:
- **Standard**: Basic VA-style layout
- **Clinical**: Clinical trial focused layout
- **Research**: Research-oriented design
- **Review**: Literature review format

### 5. ExtractionHistory Component
**Purpose**: Shows list of previous extractions

**Props**:
- `extractions: ExtractionSummary[]` - List of extractions
- `onSelect: (id: string) => void` - Callback when extraction selected
- `onDelete: (id: string) => void` - Callback to delete extraction

**Features**:
- Paginated list view
- Search/filter functionality
- Sort by date, title, confidence
- Bulk actions (delete, export)
- Preview mode

## Layout Components

### 6. MainLayout Component
**Purpose**: Primary application layout

**Structure**:
```
┌─────────────────────────────────┐
│           Header                │
├─────────────────────────────────┤
│  Sidebar  │   Main Content      │
│           │                     │
│  - Recent │   - Input Section   │
│  - History│   - Results Section │
│  - Settings│  - Actions Section │
└─────────────────────────────────┘
```

**Features**:
- Responsive design (mobile-first)
- Collapsible sidebar
- Breadcrumb navigation
- Progress indicator
- Toast notifications

### 7. Header Component
**Purpose**: Application header with navigation and actions

**Elements**:
- Logo and app title
- Navigation menu
- User actions (if auth implemented)
- Settings dropdown
- Help/documentation links

### 8. Sidebar Component
**Purpose**: Navigation and quick actions

**Sections**:
- Recent extractions
- Saved templates
- Settings panel
- Help and documentation

## Utility Components

### 9. LoadingSpinner Component
**Purpose**: Consistent loading indicators

**Variants**:
- Page loader (full screen)
- Section loader (within containers)
- Button loader (inline)
- File upload loader

### 10. ErrorBoundary Component
**Purpose**: Catches and displays JavaScript errors

**Features**:
- Error logging
- User-friendly error messages
- Recovery options
- Fallback UI

### 11. Toast Component
**Purpose**: User notifications and feedback

**Types**:
- Success messages
- Error notifications
- Warning alerts
- Info messages

**Features**:
- Auto-dismiss timers
- Action buttons
- Positioning options
- Animation effects

## Form Components

### 12. ValidationMessage Component
**Purpose**: Displays form validation errors

**Props**:
- `errors: ValidationError[]` - Array of validation errors
- `field?: string` - Specific field to show errors for

### 13. ProgressBar Component
**Purpose**: Shows progress for long-running operations

**Props**:
- `progress: number` - Progress percentage (0-100)
- `label?: string` - Progress label
- `variant?: 'default' | 'success' | 'error'` - Visual style

## Data Display Components

### 14. ConfidenceScore Component
**Purpose**: Displays extraction confidence levels

**Props**:
- `score: number` - Confidence score (0-1)
- `label: string` - Score label
- `variant?: 'badge' | 'bar' | 'circle'` - Display style

**Visual Indicators**:
- 0.9-1.0: High confidence (green)
- 0.7-0.89: Medium confidence (yellow)
- 0.0-0.69: Low confidence (red)

### 15. DataSection Component
**Purpose**: Reusable section for displaying extracted data

**Props**:
- `title: string` - Section title
- `data: any` - Section data
- `editable?: boolean` - Whether section can be edited
- `confidence?: number` - Confidence score
- `onEdit?: (data: any) => void` - Edit callback

## Responsive Design Specifications

### Breakpoints
- Mobile: 320px - 768px
- Tablet: 769px - 1024px
- Desktop: 1025px+

### Mobile Adaptations
- Stack layout (sidebar becomes drawer)
- Touch-friendly buttons and inputs
- Simplified navigation
- Swipe gestures for history
- Optimized file upload interface

### Accessibility Requirements
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management
- ARIA labels and descriptions

## State Management

### Global State
- Current extraction data
- Extraction history
- Application settings
- User preferences
- Loading states
- Error states

### Local Component State
- Form inputs
- UI states (collapsed/expanded)
- Temporary data
- Validation errors

## Performance Considerations

### Optimization Strategies
- Lazy loading for large components
- Virtual scrolling for long lists
- Image optimization and lazy loading
- Code splitting by routes
- Caching for API responses
- Debounced search inputs

### Bundle Size Targets
- Initial bundle: < 250KB gzipped
- Individual components: < 50KB
- Total application: < 1MB

## Testing Specifications

### Unit Testing
- Component rendering tests
- Props validation tests
- State management tests
- Event handler tests
- Accessibility tests

### Integration Testing
- API integration tests
- File upload flow tests
- Form submission tests
- Navigation tests

### E2E Testing
- Complete user workflows
- PDF upload and processing
- URL extraction flow
- PowerPoint generation
- Error handling scenarios

## Development Guidelines

### Code Standards
- TypeScript strict mode
- ESLint + Prettier configuration
- Component documentation
- Props interface definitions
- Error boundary implementations

### File Structure
```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── forms/        # Form-specific components
│   ├── layout/       # Layout components
│   └── features/     # Feature-specific components
├── hooks/            # Custom React hooks
├── types/            # TypeScript definitions
├── utils/            # Utility functions
├── services/         # API services
└── styles/           # Global styles
```

This specification provides a comprehensive foundation for building the JAMA VA Abstractor application with well-defined components, clear interfaces, and consistent patterns.
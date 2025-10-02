// Generated TypeScript types for JAMA VA Abstractor API

export interface ArticleExtraction {
  id: string;
  createdAt: string;
  source: {
    type: 'url' | 'pdf';
    url?: string;
    filename?: string;
    fileSize?: number;
  };
  data: ArticleData;
  confidence?: {
    overall: number;
    population: number;
    intervention: number;
    setting: number;
    outcome: number;
    findings: number;
  };
  processingTime?: number;
}

export interface ArticleData {
  title: string;
  authors?: string[];
  journal?: string;
  publicationDate?: string;
  doi?: string;
  population: Population;
  intervention: Intervention;
  setting: Setting;
  outcome: Outcome;
  findings: Findings;
  abstract?: string;
  keywords?: string[];
}

export interface Population {
  description: string;
  size?: number;
  demographics?: {
    age?: {
      mean?: number;
      range?: string;
    };
    gender?: {
      male?: number;
      female?: number;
    };
    ethnicity?: Record<string, number>;
  };
}

export interface Intervention {
  type: string;
  description: string;
  duration?: string;
  control?: string;
}

export interface Setting {
  type: 'clinical' | 'community' | 'home' | 'hospital' | 'primary_care' | 'specialty_care' | 'remote';
  description: string;
  location?: string;
  institutions?: string[];
}

export interface Outcome {
  primary: OutcomeMeasure[];
  secondary?: OutcomeMeasure[];
}

export interface OutcomeMeasure {
  measure: string;
  description?: string;
  timepoint?: string;
}

export interface Findings {
  keyResults: string[];
  statisticalSignificance?: {
    pValue?: number;
    confidenceInterval?: string;
  };
  clinicalSignificance?: string;
  limitations?: string[];
  conclusions?: string;
}

export interface ExtractionSummary {
  id: string;
  createdAt: string;
  title: string;
  source: {
    type: 'url' | 'pdf';
    filename?: string;
  };
  confidence?: number;
}

export interface ApiError {
  error: string;
  message: string;
  details?: string;
  code?: number;
  timestamp: string;
}

// Request/Response types
export interface ExtractFromUrlRequest {
  url: string;
  options?: {
    includeReferences?: boolean;
    extractImages?: boolean;
  };
}

export interface ExtractFromPdfRequest {
  file: File;
  options?: {
    language?: 'en' | 'es' | 'fr' | 'de';
    ocrMode?: 'auto' | 'force' | 'skip';
  };
}

export interface GenerateAbstractRequest {
  extractionId?: string;
  customData?: ArticleData;
  template?: 'standard' | 'clinical' | 'research' | 'review';
  branding?: {
    logo?: string;
    institution?: string;
    colors?: {
      primary?: string;
      secondary?: string;
    };
  };
}

export interface GenerateAbstractResponse {
  downloadUrl: string;
  expiresAt: string;
  fileSize: number;
}

// API Client types
export interface ApiClient {
  extractFromUrl(request: ExtractFromUrlRequest): Promise<ArticleExtraction>;
  extractFromPdf(request: ExtractFromPdfRequest): Promise<ArticleExtraction>;
  generateAbstract(request: GenerateAbstractRequest): Promise<GenerateAbstractResponse>;
  getExtraction(id: string): Promise<ArticleExtraction>;
  listExtractions(limit?: number, offset?: number): Promise<{
    extractions: ExtractionSummary[];
    total: number;
    hasMore: boolean;
  }>;
}

// Utility types
export type ExtractionStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type TemplateType = 'standard' | 'clinical' | 'research' | 'review';
export type SourceType = 'url' | 'pdf';
export type SettingType = 'clinical' | 'community' | 'home' | 'hospital' | 'primary_care' | 'specialty_care' | 'remote';

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState {
  isLoading: boolean;
  errors: ValidationError[];
  success: boolean;
}

// Component props types
export interface FileUploadProps {
  onFileSelect: (file: File) => void;
  acceptedTypes: string[];
  maxSize: number;
  disabled?: boolean;
}

export interface UrlInputProps {
  onUrlSubmit: (url: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export interface ExtractionResultProps {
  extraction: ArticleExtraction;
  onGenerateAbstract: () => void;
  onEdit: () => void;
}

export interface PowerPointGeneratorProps {
  extractionId: string;
  template: TemplateType;
  branding?: GenerateAbstractRequest['branding'];
  onGenerated: (response: GenerateAbstractResponse) => void;
}

// Hook types
export interface UseExtractionResult {
  extract: (source: ExtractFromUrlRequest | ExtractFromPdfRequest) => Promise<void>;
  extraction: ArticleExtraction | null;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export interface UseAbstractGenerationResult {
  generate: (request: GenerateAbstractRequest) => Promise<void>;
  downloadUrl: string | null;
  isGenerating: boolean;
  error: string | null;
  reset: () => void;
}

// Configuration types
export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  upload: {
    maxFileSize: number;
    allowedTypes: string[];
  };
  powerpoint: {
    defaultTemplate: TemplateType;
    supportedFormats: string[];
  };
}

// Storage types (for caching extractions)
export interface StorageAdapter {
  getItem<T>(key: string): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}
import { 
  ApiClient, 
  ArticleExtraction, 
  ExtractionSummary,
  ExtractFromUrlRequest, 
  ExtractFromPdfRequest, 
  GenerateAbstractRequest,
  GenerateAbstractResponse,
  ApiError 
} from '../types/api';

class JamaAbstractorApiClient implements ApiClient {
  private baseUrl: string;
  private apiKey?: string;
  private timeout: number;

  constructor(config: { baseUrl: string; apiKey?: string; timeout?: number }) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 30000; // 30 seconds default
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let error: ApiError;
        try {
          error = await response.json();
        } catch {
          error = {
            error: 'HTTP_ERROR',
            message: `HTTP ${response.status}: ${response.statusText}`,
            timestamp: new Date().toISOString(),
          };
        }
        throw new ApiClientError(error.message, response.status, error);
      }

      // Handle binary responses (like PowerPoint files)
      if (response.headers.get('content-type')?.includes('application/vnd.openxmlformats')) {
        return response.blob() as Promise<T>;
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiClientError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiClientError('Request timeout', 408);
        }
        throw new ApiClientError(error.message, 0);
      }

      throw new ApiClientError('Unknown error occurred', 0);
    }
  }

  async extractFromUrl(request: ExtractFromUrlRequest): Promise<ArticleExtraction> {
    return this.request<ArticleExtraction>('/api/extract/url', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async extractFromPdf(request: ExtractFromPdfRequest): Promise<ArticleExtraction> {
    const formData = new FormData();
    formData.append('file', request.file);
    
    if (request.options) {
      formData.append('options', JSON.stringify(request.options));
    }

    return this.request<ArticleExtraction>('/api/extract/pdf', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  async generateAbstract(request: GenerateAbstractRequest): Promise<GenerateAbstractResponse> {
    return this.request<GenerateAbstractResponse>('/api/generate/abstract', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getExtraction(id: string): Promise<ArticleExtraction> {
    return this.request<ArticleExtraction>(`/api/extractions/${encodeURIComponent(id)}`);
  }

  async listExtractions(limit = 10, offset = 0): Promise<{
    extractions: ExtractionSummary[];
    total: number;
    hasMore: boolean;
  }> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    return this.request<{
      extractions: ExtractionSummary[];
      total: number;
      hasMore: boolean;
    }>(`/api/extractions?${params}`);
  }

  // Utility method to download PowerPoint file
  async downloadPowerPoint(request: GenerateAbstractRequest): Promise<Blob> {
    const formData = new FormData();
    formData.append('data', JSON.stringify(request));

    const response = await fetch(`${this.baseUrl}/api/generate/abstract`, {
      method: 'POST',
      body: formData,
      headers: this.apiKey ? { 'X-API-Key': this.apiKey } : {},
    });

    if (!response.ok) {
      throw new ApiClientError(`Failed to generate PowerPoint: ${response.statusText}`, response.status);
    }

    return response.blob();
  }

  // Health check method
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/api/health');
  }
}

export class ApiClientError extends Error {
  public readonly statusCode: number;
  public readonly apiError?: ApiError;

  constructor(message: string, statusCode: number, apiError?: ApiError) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.apiError = apiError;
  }

  get isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  get isServerError(): boolean {
    return this.statusCode >= 500;
  }

  get isNetworkError(): boolean {
    return this.statusCode === 0;
  }

  get isTimeoutError(): boolean {
    return this.statusCode === 408;
  }
}

// Create default client instance
const createApiClient = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  const apiKey = import.meta.env.VITE_API_KEY;
  
  return new JamaAbstractorApiClient({
    baseUrl,
    apiKey,
    timeout: 60000, // 60 seconds for file processing
  });
};

export const apiClient = createApiClient();
export { JamaAbstractorApiClient };

// React hook for API client
import { useCallback, useRef } from 'react';

export const useApiClient = () => {
  const clientRef = useRef<JamaAbstractorApiClient>(apiClient);

  const withErrorHandling = useCallback(
    <T extends any[], R>(
      apiMethod: (...args: T) => Promise<R>
    ) => {
      return async (...args: T): Promise<R> => {
        try {
          return await apiMethod(...args);
        } catch (error) {
          if (error instanceof ApiClientError) {
            // Handle specific API errors
            if (error.isNetworkError) {
              throw new Error('Network connection failed. Please check your internet connection.');
            }
            if (error.isTimeoutError) {
              throw new Error('Request timed out. Please try again.');
            }
            if (error.statusCode === 413) {
              throw new Error('File too large. Maximum size is 10MB.');
            }
            if (error.statusCode === 404) {
              throw new Error('Article not found or not accessible.');
            }
          }
          throw error;
        }
      };
    },
    []
  );

  return {
    extractFromUrl: withErrorHandling(
      (request: ExtractFromUrlRequest) => clientRef.current.extractFromUrl(request)
    ),
    extractFromPdf: withErrorHandling(
      (request: ExtractFromPdfRequest) => clientRef.current.extractFromPdf(request)
    ),
    generateAbstract: withErrorHandling(
      (request: GenerateAbstractRequest) => clientRef.current.generateAbstract(request)
    ),
    getExtraction: withErrorHandling(
      (id: string) => clientRef.current.getExtraction(id)
    ),
    listExtractions: withErrorHandling(
      (limit?: number, offset?: number) => clientRef.current.listExtractions(limit, offset)
    ),
    downloadPowerPoint: withErrorHandling(
      (request: GenerateAbstractRequest) => clientRef.current.downloadPowerPoint(request)
    ),
    healthCheck: withErrorHandling(
      () => clientRef.current.healthCheck()
    ),
  };
};
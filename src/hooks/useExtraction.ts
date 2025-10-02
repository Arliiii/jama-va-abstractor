import { useState, useCallback } from 'react';
import { 
  ArticleExtraction, 
  ExtractFromUrlRequest, 
  ExtractFromPdfRequest,
  UseExtractionResult 
} from '../types/api';
import { useApiClient } from '../services/api-client';

export const useExtraction = (): UseExtractionResult => {
  const [extraction, setExtraction] = useState<ArticleExtraction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const apiClient = useApiClient();

  const extract = useCallback(async (source: ExtractFromUrlRequest | ExtractFromPdfRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let result: ArticleExtraction;
      
      if ('url' in source) {
        result = await apiClient.extractFromUrl(source);
      } else {
        result = await apiClient.extractFromPdf(source);
      }
      
      setExtraction(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      setExtraction(null);
    } finally {
      setIsLoading(false);
    }
  }, [apiClient]);

  const reset = useCallback(() => {
    setExtraction(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    extract,
    extraction,
    isLoading,
    error,
    reset,
  };
};
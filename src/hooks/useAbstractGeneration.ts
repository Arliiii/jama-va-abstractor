import { useState, useCallback } from 'react';
import { 
  GenerateAbstractRequest, 
  GenerateAbstractResponse,
  UseAbstractGenerationResult 
} from '../types/api';
import { useApiClient } from '../services/api-client';

export const useAbstractGeneration = (): UseAbstractGenerationResult => {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const apiClient = useApiClient();

  const generate = useCallback(async (request: GenerateAbstractRequest) => {
    setIsGenerating(true);
    setError(null);
    setDownloadUrl(null);
    
    try {
      const result = await apiClient.generateAbstract(request);
      setDownloadUrl(result.downloadUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate PowerPoint';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [apiClient]);

  const reset = useCallback(() => {
    setDownloadUrl(null);
    setError(null);
    setIsGenerating(false);
  }, []);

  return {
    generate,
    downloadUrl,
    isGenerating,
    error,
    reset,
  };
};
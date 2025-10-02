import { useState, useCallback, useEffect } from 'react';

// Types for the new backend API
interface ProcessingStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  message: string;
  timestamp?: string;
}

interface JobStatus {
  job_id: string;
  status: 'started' | 'processing' | 'completed' | 'failed';
  steps: ProcessingStep[];
  result?: {
    summaries: Record<string, string>;
    medical_icon: string;
    file_path: string;
    quality_score: number;
    extracted_data: any;
  };
  error?: string;
  created_at: string;
  updated_at: string;
}

interface ExtractionSource {
  type: 'url' | 'pdf';
  url?: string;
  file?: File;
}

export const useExtraction = () => {
  const [jobId, setJobId] = useState<string | null>(null);
  const [steps, setSteps] = useState<ProcessingStep[]>([]);
  const [result, setResult] = useState<JobStatus['result'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const startExtraction = useCallback(async (source: ExtractionSource) => {
    try {
      setError(null);
      setResult(null);
      setIsProcessing(true);

      // Create FormData for the request
      const formData = new FormData();
      
      if (source.type === 'url' && source.url) {
        formData.append('url', source.url);
      } else if (source.type === 'pdf' && source.file) {
        formData.append('file', source.file);
      } else {
        throw new Error('Invalid source provided');
      }

      // Start the extraction job
      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const { job_id } = await response.json();
      setJobId(job_id);
      
      // Start listening to progress updates
      startProgressTracking(job_id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start extraction';
      setError(errorMessage);
      setIsProcessing(false);
    }
  }, []);

  const startProgressTracking = useCallback((jobId: string) => {
    const eventSource = new EventSource(`/api/progress/${jobId}`);
    
    eventSource.onmessage = (event) => {
      try {
        const job: JobStatus = JSON.parse(event.data);
        setSteps(job.steps);
        
        if (job.status === 'completed') {
          setResult(job.result || null);
          setIsProcessing(false);
          eventSource.close();
        } else if (job.status === 'failed') {
          setError(job.error || 'Processing failed');
          setIsProcessing(false);
          eventSource.close();
        }
      } catch (err) {
        console.error('Error parsing progress update:', err);
      }
    };

    eventSource.onerror = (event) => {
      console.error('EventSource error:', event);
      eventSource.close();
      setIsProcessing(false);
      
      // Fallback to polling if SSE fails
      pollJobStatus(jobId);
    };

    // Cleanup on unmount or job completion
    return () => {
      eventSource.close();
    };
  }, []);

  const pollJobStatus = useCallback(async (jobId: string) => {
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;
    
    const poll = async () => {
      try {
        const response = await fetch(`/api/status/${jobId}`);
        if (response.ok) {
          const job: JobStatus = await response.json();
          setSteps(job.steps);
          
          if (job.status === 'completed') {
            setResult(job.result || null);
            setIsProcessing(false);
            return;
          } else if (job.status === 'failed') {
            setError(job.error || 'Processing failed');
            setIsProcessing(false);
            return;
          }
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000); // Poll every 5 seconds
        } else {
          setError('Processing timeout - please try again');
          setIsProcessing(false);
        }
      } catch (err) {
        console.error('Polling error:', err);
        setError('Connection error - please refresh and try again');
        setIsProcessing(false);
      }
    };
    
    poll();
  }, []);

  const downloadPowerPoint = useCallback(async () => {
    if (!jobId) {
      throw new Error('No job ID available for download');
    }

    const response = await fetch(`/api/download/${jobId}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Download failed');
    }

    // Create blob and download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `va_abstract_${jobId}.pptx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, [jobId]);

  const reset = useCallback(() => {
    setJobId(null);
    setSteps([]);
    setResult(null);
    setError(null);
    setIsProcessing(false);
  }, []);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup any ongoing EventSource connections
      setIsProcessing(false);
    };
  }, []);

  return {
    startExtraction,
    steps,
    result,
    error,
    isProcessing,
    downloadPowerPoint,
    reset,
    jobId,
  };
};
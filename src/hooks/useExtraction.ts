import { useState, useCallback, useEffect } from 'react';

// Types for the new backend API
interface ProcessingStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  message: string;
  timestamp?: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'error' | 'warning';
  message: string;
  step: string;
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

export const useExtraction = () => {
  const [jobId, setJobId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const startProgressTracking = useCallback((jobId: string) => {
    const eventSource = new EventSource(`http://localhost:8001/api/progress/${jobId}`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Progress update:', data);
        
        // Update current step based on progress
        if (data.steps) {
          const completedSteps = data.steps.filter((step: any) => step.status === 'completed').length;
          const processingSteps = data.steps.filter((step: any) => step.status === 'processing').length;
          
          if (data.status === 'completed') {
            setCurrentStep(5); // All completed
          } else {
            setCurrentStep(completedSteps + (processingSteps > 0 ? 1 : 0));
          }
        }
        
        // Add log entries for step updates
        if (data.steps) {
          data.steps.forEach((step: any) => {
            if (step.message) {
              setLogs(prev => {
                const exists = prev.some(log => log.step === step.id && log.message === step.message);
                if (!exists) {
                  return [...prev, {
                    id: `${step.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    timestamp: step.timestamp || new Date().toISOString(),
                    level: step.status === 'completed' ? 'success' : step.status === 'error' ? 'error' : 'info',
                    message: step.message,
                    step: step.name
                  }];
                }
                return prev;
              });
            }
          });
        }
        
        // Check if completed
        if (data.status === 'completed') {
          setExtractedData(data.result);
          setIsExtracting(false);
          eventSource.close();
        } else if (data.status === 'failed') {
          setError(data.error || 'Processing failed');
          setIsExtracting(false);
          eventSource.close();
        }
        
      } catch (err) {
        console.error('Error parsing progress data:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('EventSource error:', err);
      setError('Connection to server lost');
      setIsExtracting(false);
      eventSource.close();
    };

    // Cleanup on unmount
    return () => eventSource.close();
  }, []);

  const startExtraction = useCallback(async (file: File | null, url: string) => {
    try {
      setIsExtracting(true);
      setError(null);
      setCurrentStep(0);
      setLogs([]);
      setExtractedData(null);

      const formData = new FormData();
      
      if (file) {
        formData.append('file', file);
      } else if (url) {
        formData.append('url', url);
      } else {
        throw new Error('Either file or URL must be provided');
      }

      console.log('Starting extraction with:', file ? `file: ${file.name}` : `url: ${url}`);

      // Start the extraction process
      const response = await fetch('http://localhost:8001/api/extract', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Server error (${response.status}): ${errorText}`);
      }

      const result = await response.json();
      console.log('Extraction started:', result);
      setJobId(result.job_id);

      // Start progress tracking
      startProgressTracking(result.job_id);

    } catch (err) {
      console.error('Extraction error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to start processing: ${errorMessage}`);
      setIsExtracting(false);
    }
  }, [startProgressTracking]);



  const downloadPowerPoint = useCallback(async (jobId: string) => {
    if (!jobId) {
      throw new Error('No job ID available for download');
    }

    const response = await fetch(`http://localhost:8001/api/download/${jobId}`);
    
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
  }, []);

  const reset = useCallback(() => {
    setJobId(null);
    setCurrentStep(0);
    setLogs([]);
    setExtractedData(null);
    setError(null);
    setIsExtracting(false);
  }, []);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup any ongoing EventSource connections
      setIsExtracting(false);
    };
  }, []);

  return {
    startExtraction,
    currentStep,
    logs,
    extractedData,
    error,
    isExtracting,
    downloadPowerPoint,
    reset,
    jobId,
  };
};
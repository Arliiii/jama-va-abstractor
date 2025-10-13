import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressTracker } from "@/components/ProgressTracker";
import { LogViewer } from "@/components/LogViewer";
import { SummaryDisplay } from "@/components/SummaryDisplay";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { FileUploadZone } from "@/components/FileUploadZone";
import { FileText, Loader2, Download, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { useExtraction } from "@/hooks/useExtraction";

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
  step: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  details?: string;
  duration?: number;
}

interface ErrorDetails {
  step: string;
  code: string;
  message: string;
  reason: string;
  timestamp: string;
  recoveryActions: string[];
  technicalDetails?: string;
  relatedLinks?: Array<{
    title: string;
    url: string;
  }>;
}

const Index = () => {
  const { toast } = useToast();
  const [articleUrl, setArticleUrl] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showLogs, setShowLogs] = useState(false);
  
  const {
    currentStep,
    logs: extractionLogs,
    extractedData,
    error,
    isExtracting,
    jobId,
    downloadPowerPoint,
    startExtraction
  } = useExtraction();

  // Transform backend data to SummaryDisplay format
  const transformExtractedData = (backendData: any) => {
    if (!backendData || !backendData.summaries) {
      return null;
    }

    const summaries = backendData.summaries;
    
    return {
      title: summaries.title || 'Clinical Study',
      population: {
        size: summaries.population || 'Not specified',
        demographics: summaries.demographics || 'Not specified',
        criteria: summaries.inclusion_criteria || summaries.criteria || 'Not specified'
      },
      intervention: {
        treatment: summaries.intervention || 'Not specified',
        duration: summaries.duration || 'Not specified',
        control: summaries.control || summaries.comparator || 'Not specified'
      },
      setting: {
        location: summaries.setting || 'Not specified',
        type: summaries.study_type || 'Clinical study',
        duration: summaries.study_duration || summaries.duration || 'Not specified'
      },
      outcomes: {
        primary: summaries.primary_outcome || summaries.outcomes || 'Not specified',
        secondary: summaries.secondary_outcomes ? summaries.secondary_outcomes.split(',').map((s: string) => s.trim()) : [],
        measurements: summaries.measurements || summaries.endpoints || 'Not specified'
      },
      findings: {
        primary: summaries.findings || summaries.results || 'Not specified',
        secondary: summaries.secondary_findings || summaries.secondary_results || 'Not specified',
        significance: summaries.significance || summaries.statistical_significance || 'Not specified',
        limitations: summaries.limitations || summaries.study_limitations || 'Not specified'
      },
      medicalIcon: backendData.medical_icon || 'general'
    };
  };

  // Enable dark mode by default
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  }, []);

  const validateJamaUrl = (url: string) => {
    if (!url) return true; // Allow empty for validation display
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('jamanetwork.com') || 
             urlObj.hostname.includes('jama.ama-assn.org');
    } catch {
      return false;
    }
  };



  const handleGenerate = async () => {
    if (!articleUrl && !uploadedFile) {
      toast({
        title: "Input Required",
        description: "Please provide a JAMA article URL or upload a PDF file.",
        variant: "destructive",
      });
      return;
    }

    if (articleUrl && !validateJamaUrl(articleUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please provide a valid JAMA Network article URL.",
        variant: "destructive",
      });
      return;
    }

    setShowLogs(true);
    
    try {
      await startExtraction(uploadedFile, articleUrl);
      toast({
        title: "Processing Started",
        description: "Your JAMA article is being processed. You can monitor the progress below.",
      });
    } catch (error) {
      toast({
        title: "Processing Failed",
        description: "Failed to start processing. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async () => {
    if (!jobId) {
      toast({
        title: "No Presentation Available",
        description: "Please process an article first before downloading.",
        variant: "destructive",
      });
      return;
    }

    try {
      await downloadPowerPoint(jobId);
      toast({
        title: "Download Started",
        description: "Your PowerPoint presentation is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download the presentation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRetry = () => {
    handleGenerate();
  };

  const handleDismissError = () => {
    // Error will be handled by the useExtraction hook
  };

  // Convert currentStep to processing steps for display
  const processingSteps: ProcessingStep[] = currentStep > 0 ? [
    { 
      id: '1', 
      name: 'Scraping Article', 
      status: (currentStep > 1 ? 'completed' : currentStep === 1 ? 'processing' : 'pending') as 'pending' | 'processing' | 'completed' | 'error', 
      message: currentStep > 1 ? 'Successfully extracted article content' : 'Extracting content from JAMA article...', 
      timestamp: new Date().toISOString() 
    },
    { 
      id: '2', 
      name: 'Parsing Data', 
      status: (currentStep > 2 ? 'completed' : currentStep === 2 ? 'processing' : 'pending') as 'pending' | 'processing' | 'completed' | 'error', 
      message: currentStep > 2 ? 'Successfully parsed extracted content' : 'Parsing medical data from content...', 
      timestamp: new Date().toISOString() 
    },
    { 
      id: '3', 
      name: 'Summarizing Findings', 
      status: (currentStep > 3 ? 'completed' : currentStep === 3 ? 'processing' : 'pending') as 'pending' | 'processing' | 'completed' | 'error', 
      message: currentStep > 3 ? 'Successfully generated AI summary' : 'Generating AI summary...', 
      timestamp: new Date().toISOString() 
    },
    { 
      id: '4', 
      name: 'Generating PowerPoint', 
      status: (currentStep > 4 ? 'completed' : currentStep === 4 ? 'processing' : 'pending') as 'pending' | 'processing' | 'completed' | 'error', 
      message: currentStep > 4 ? 'Successfully created presentation' : 'Creating VA-style presentation...', 
      timestamp: new Date().toISOString() 
    }
  ] : [];
  
  const isComplete = currentStep === 5; // All steps completed
  const hasError = !!error;

  return (
    <div className="min-h-screen dark">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="bg-grid absolute inset-0 opacity-20"></div>
      </div>

      {/* Header with gradient background */}
      <header className="relative overflow-hidden animate-slide-in-down">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 opacity-80"></div>
        <div className="glass-card border-0 border-b backdrop-blur-xl relative z-10">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center float-animation shadow-lg hover-glow">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gradient-blue animate-fade-in">
                  JAMA VA Abstractor
                </h1>
                <p className="text-sm text-slate-300 mt-1 font-medium animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  AI-powered VA-style presentation generator for medical research articles
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="container mx-auto px-6 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Input & Logs */}
          <div className="lg:col-span-2 space-y-8">
            {/* Input Section */}
            <Card className="glass-card hover-lift border-0 shadow-lg animate-slide-in-left">
              <CardContent className="pt-8 pb-8 px-8 space-y-6">
                <div className="space-y-3">
                  <label htmlFor="article-url" className="text-base font-semibold text-slate-200 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>JAMA Article URL</span>
                  </label>
                  <Input
                    id="article-url"
                    type="url"
                    placeholder="https://jamanetwork.com/journals/jama/article/..."
                    value={articleUrl}
                    onChange={(e) => setArticleUrl(e.target.value)}
                    disabled={isExtracting || !!uploadedFile}
                    className={`h-12 px-4 text-base border-0 bg-gradient-to-r from-slate-800 to-slate-700 text-slate-200 rounded-xl shadow-inner transition-all duration-200 focus:from-slate-700 focus:to-slate-600 focus:shadow-md placeholder:text-slate-400 ${
                      articleUrl && !validateJamaUrl(articleUrl) 
                        ? "from-red-900 to-rose-800 ring-2 ring-red-400" 
                        : "focus:ring-2 focus:ring-blue-400"
                    }`}
                  />
                  {articleUrl && !validateJamaUrl(articleUrl) && (
                    <div className="flex items-center space-x-2 p-3 bg-gradient-to-r from-red-50 to-rose-50 rounded-lg border border-red-200">
                      <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      <p className="text-sm text-red-700 font-medium">
                        Please enter a valid JAMA Network URL
                      </p>
                    </div>
                  )}
                </div>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 rounded-full shadow-sm border border-slate-600">
                      OR
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-base font-semibold text-slate-200 mb-3 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Upload PDF</span>
                  </label>
                  {uploadedFile ? (
                    <div className="border-0 rounded-xl p-5 bg-gradient-to-r from-green-900 to-emerald-900 shadow-md border border-green-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-base font-semibold text-slate-200">
                              {uploadedFile.name}
                            </p>
                            <p className="text-sm text-green-400 font-medium">
                              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to process
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUploadedFile(null)}
                          disabled={isExtracting}
                          className="border-green-600 text-green-400 hover:bg-green-800 rounded-lg px-4 py-2 font-medium"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <FileUploadZone onFileSelect={setUploadedFile} />
                  )}
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isExtracting || (!articleUrl && !uploadedFile) || (articleUrl && !validateJamaUrl(articleUrl))}
                  className="w-full btn-gradient-primary border-0 text-white font-semibold py-6 text-lg shadow-lg hover-glow ripple-effect transform transition-all duration-300"
                  size="lg"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      <span className="animate-shimmer">Processing Your Article...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5 mr-3 animate-bounce" />
                      Generate VA PowerPoint
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Progress Tracker */}
            {(processingSteps.length > 0 || isExtracting) && (
              <div className="animate-slide-in-up">
                <ProgressTracker steps={processingSteps} />
              </div>
            )}

            {/* Log Viewer */}
            <div className="animate-fade-in">
              <LogViewer logs={extractionLogs} isVisible={showLogs} />
            </div>

            {/* Error Display */}
            {error && (
              <div className="animate-scale-in">
                <ErrorDisplay 
                  error={{
                    step: 'Processing',
                    code: 'EXTRACTION_ERROR',
                    message: error,
                    reason: 'An error occurred during processing',
                    timestamp: new Date().toISOString(),
                    recoveryActions: ['Check your internet connection', 'Try again', 'Contact support if the issue persists']
                  }} 
                  onRetry={handleRetry}
                  onDismiss={handleDismissError}
                />
              </div>
            )}
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-1 space-y-8">
            {/* Download Section */}
            {isComplete && (
              <Card className="glass-card border-0 shadow-xl bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 hover-lift animate-scale-in">
                <CardContent className="pt-8 pb-8 px-8">
                  <div className="text-center space-y-6">
                    <div className="relative animate-bounce">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg pulse-glow">
                        <CheckCircle className="w-10 h-10 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full animate-ping"></div>
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-emerald-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                    </div>
                    
                    <div className="animate-slide-in-up">
                      <h3 className="text-xl font-bold text-gradient-green mb-2">
                        🎉 PowerPoint Generated!
                      </h3>
                      <p className="text-sm text-green-700 leading-relaxed">
                        Your professional VA-style presentation is ready for download with all the extracted insights.
                      </p>
                    </div>

                    <Button
                      onClick={handleDownload}
                      className="w-full btn-gradient-success border-0 text-white font-semibold py-4 text-base shadow-lg hover-scale ripple-effect"
                      size="lg"
                    >
                      <Download className="w-5 h-5 mr-3 animate-bounce" />
                      Download PowerPoint
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Summary Display */}
            {extractedData && transformExtractedData(extractedData) && (
              <div className="animate-slide-in-right">
                <SummaryDisplay data={transformExtractedData(extractedData)!} isVisible={true} />
              </div>
            )}
            
            {/* Processing Info */}
            {!isComplete && !hasError && processingSteps.length === 0 && (
              <Card className="glass-card border-0 shadow-lg bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 hover-lift border border-slate-600 animate-slide-in-right">
                <CardContent className="pt-8 pb-8 px-8">
                  <div className="text-center space-y-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg float-animation hover-glow">
                        <FileText className="w-10 h-10 text-white" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500 rounded-2xl opacity-20 animate-pulse"></div>
                    </div>
                    
                    <div className="animate-fade-in">
                      <h3 className="text-xl font-bold text-gradient-blue mb-2">
                        Ready to Transform Research
                      </h3>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        Upload a medical research article or enter a JAMA URL to generate your professional VA-style presentation.
                      </p>
                    </div>

                    <div className="flex items-center justify-center space-x-6 text-xs text-slate-400">
                      <div className="flex items-center space-x-2 stagger-item">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <span>AI-Powered</span>
                      </div>
                      <div className="flex items-center space-x-2 stagger-item">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <span>VA-Style</span>
                      </div>
                      <div className="flex items-center space-x-2 stagger-item">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        <span>Professional</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;

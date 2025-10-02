import { useState } from "react";
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
  const processingSteps = currentStep > 0 ? [
    { id: '1', name: 'Scraping Article', status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'processing' : 'pending' as const, message: currentStep > 1 ? 'Successfully extracted article content' : 'Extracting content from JAMA article...', timestamp: new Date().toISOString() },
    { id: '2', name: 'Parsing Data', status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'processing' : 'pending' as const, message: currentStep > 2 ? 'Successfully parsed extracted content' : 'Parsing medical data from content...', timestamp: new Date().toISOString() },
    { id: '3', name: 'Summarizing Findings', status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'processing' : 'pending' as const, message: currentStep > 3 ? 'Successfully generated AI summary' : 'Generating AI summary...', timestamp: new Date().toISOString() },
    { id: '4', name: 'Generating PowerPoint', status: currentStep > 4 ? 'completed' : currentStep === 4 ? 'processing' : 'pending' as const, message: currentStep > 4 ? 'Successfully created presentation' : 'Creating VA-style presentation...', timestamp: new Date().toISOString() }
  ] : [];
  
  const isComplete = currentStep === 5; // All steps completed
  const hasError = !!error;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-foreground">JAMA VA Abstractor</h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered VA-style presentation generator for JAMA research articles
          </p>
        </div>
      </header>

      {/* Main Layout */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Input & Logs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Input Section */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <label htmlFor="article-url" className="text-sm font-medium text-foreground">
                    JAMA Article URL
                  </label>
                  <Input
                    id="article-url"
                    type="url"
                    placeholder="https://jamanetwork.com/journals/jama/article/..."
                    value={articleUrl}
                    onChange={(e) => setArticleUrl(e.target.value)}
                    disabled={isExtracting || !!uploadedFile}
                    className={articleUrl && !validateJamaUrl(articleUrl) ? "border-red-300 focus:border-red-500" : ""}
                  />
                  {articleUrl && !validateJamaUrl(articleUrl) && (
                    <p className="text-sm text-red-600 flex items-center mt-1">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Please enter a valid JAMA Network URL
                    </p>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Upload PDF
                  </label>
                  {uploadedFile ? (
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-6 h-6 text-primary" />
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {uploadedFile.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUploadedFile(null)}
                          disabled={isExtracting}
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
                  className="w-full"
                  size="lg"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Generate VA PowerPoint"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Progress Tracker */}
            {(processingSteps.length > 0 || isExtracting) && (
              <ProgressTracker steps={processingSteps} />
            )}

            {/* Log Viewer */}
            <LogViewer logs={extractionLogs} isVisible={showLogs} />

            {/* Error Display */}
            {error && (
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
            )}
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-1 space-y-6">
            {/* Download Section */}
            {isComplete && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-green-900">
                        PowerPoint Generated!
                      </h3>
                      <p className="text-sm text-green-700 mt-1">
                        Your VA-style presentation is ready for download.
                      </p>
                    </div>

                    <Button
                      onClick={handleDownload}
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PowerPoint
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Summary Display */}
            {extractedData && (
              <SummaryDisplay data={extractedData} isVisible={true} />
            )}
            
            {/* Processing Info */}
            {!isComplete && !hasError && processingSteps.length === 0 && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900">
                        Ready to Process
                      </h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Enter a JAMA article URL or upload a PDF to get started.
                      </p>
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

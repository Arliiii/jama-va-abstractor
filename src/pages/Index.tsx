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
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [detailedError, setDetailedError] = useState<ErrorDetails | null>(null);
  const [showLogs, setShowLogs] = useState(false);

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

  const simulateProcess = async () => {
    setIsProcessing(true);
    setShowLogs(true);

    // Mock processing steps for demonstration
    const mockSteps = [
      { id: '1', name: 'Scraping Article', status: 'processing' as const, message: 'Extracting content from JAMA article...', timestamp: new Date().toISOString() },
      { id: '2', name: 'Parsing Data', status: 'pending' as const, message: 'Waiting to parse extracted content', timestamp: new Date().toISOString() },
      { id: '3', name: 'Summarizing Findings', status: 'pending' as const, message: 'Waiting to generate AI summary', timestamp: new Date().toISOString() },
      { id: '4', name: 'Generating PowerPoint', status: 'pending' as const, message: 'Waiting to create presentation', timestamp: new Date().toISOString() }
    ];

    setProcessingSteps(mockSteps);

    // Add initial log entries
    setLogs([
      {
        id: '1',
        timestamp: new Date().toISOString(),
        step: 'Scraping',
        level: 'info',
        message: 'Starting article extraction from JAMA',
        details: articleUrl ? `URL: ${articleUrl}` : `File: ${uploadedFile?.name}`,
      }
    ]);

    // Mock processing simulation
    setTimeout(() => {
      const updatedSteps = mockSteps.map((step, index) => ({
        ...step,
        status: index === 0 ? 'completed' as const : index === 1 ? 'processing' as const : 'pending' as const,
        message: index === 0 ? 'Successfully extracted article content' : index === 1 ? 'Parsing medical data from content...' : step.message
      }));
      setProcessingSteps(updatedSteps);

      setLogs(prev => [...prev, {
        id: '2',
        timestamp: new Date().toISOString(),
        step: 'Scraping',
        level: 'success',
        message: 'Article content successfully extracted',
        details: 'Found 15,234 words of content',
        duration: 2500
      }, {
        id: '3',
        timestamp: new Date().toISOString(),
        step: 'Parsing',
        level: 'info',
        message: 'Parsing medical data and identifying key components',
        details: 'Extracting population, intervention, outcomes, and findings'
      }]);

      // Mock completion
      setTimeout(() => {
        const completedSteps = mockSteps.map(step => ({
          ...step,
          status: 'completed' as const,
          message: `Successfully ${step.name.toLowerCase()}`
        }));
        setProcessingSteps(completedSteps);
        setIsProcessing(false);

        setLogs(prev => [...prev, {
          id: '4',
          timestamp: new Date().toISOString(),
          step: 'Summarizing',
          level: 'success',
          message: 'AI summarization completed',
          details: 'Generated summaries for all sections with medical icon selection',
          duration: 1800
        }, {
          id: '5',
          timestamp: new Date().toISOString(),
          step: 'PowerPoint Generation',
          level: 'success',
          message: 'VA-style PowerPoint presentation created',
          details: 'Generated 12-slide presentation with medical branding',
          duration: 3200
        }]);

        // Set mock summary data
        setSummaryData({
          title: "Effectiveness of Novel Treatment in Clinical Trial",
          population: {
            size: "1,247 participants",
            demographics: "Adults aged 45-75, 52% female",
            criteria: "Diagnosed condition, stable medication regimen"
          },
          intervention: {
            treatment: "Novel therapeutic intervention",
            duration: "12 weeks",
            control: "Standard care control group"
          },
          setting: {
            location: "Multi-center study (15 sites)",
            type: "Randomized controlled trial",
            duration: "18-month study period"
          },
          outcomes: {
            primary: "Primary efficacy endpoint improvement",
            secondary: ["Safety measures", "Quality of life", "Biomarkers"],
            measurements: "Standardized assessment tools"
          },
          findings: {
            primary: "Significant improvement in primary endpoint with 32% relative risk reduction (p<0.001). Treatment group showed sustained benefits throughout the study period.",
            secondary: "Improved quality of life scores and favorable safety profile. No serious adverse events related to treatment.",
            significance: "Clinically meaningful and statistically significant results with narrow confidence intervals",
            limitations: "Single-blind design, limited diversity in study population, short follow-up period"
          },
          medicalIcon: "cardiology"
        });

        toast({
          title: "Success!",
          description: "Your VA-style PowerPoint presentation has been generated.",
        });
      }, 3000);
    }, 2000);
  };

  const handleGenerate = () => {
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

    // Reset all state
    setProcessingSteps([]);
    setLogs([]);
    setSummaryData(null);
    setDetailedError(null);

    simulateProcess();
  };

  const handleDownload = () => {
    // Mock download
    const mockPptContent = "Mock PowerPoint content";
    const blob = new Blob([mockPptContent], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JAMA-VA-Abstract-${new Date().toISOString().split('T')[0]}.pptx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloading...",
      description: "Your PowerPoint presentation will download shortly.",
    });
  };

  const handleRetry = () => {
    handleGenerate();
  };

  const handleDismissError = () => {
    setDetailedError(null);
  };

  const isComplete = processingSteps.length > 0 && 
    processingSteps.every(step => step.status === 'completed');
  const hasError = processingSteps.some(step => step.status === 'error') || !!detailedError;

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
                    disabled={isProcessing || !!uploadedFile}
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
                          disabled={isProcessing}
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
                  disabled={isProcessing || (!articleUrl && !uploadedFile) || (articleUrl && !validateJamaUrl(articleUrl))}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
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
            {(processingSteps.length > 0 || isProcessing) && (
              <ProgressTracker steps={processingSteps} />
            )}

            {/* Log Viewer */}
            <LogViewer logs={logs} isVisible={showLogs} />

            {/* Error Display */}
            {detailedError && (
              <ErrorDisplay 
                error={detailedError} 
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
            {summaryData && (
              <SummaryDisplay data={summaryData} isVisible={true} />
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

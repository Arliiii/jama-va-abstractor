import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { LogPanel } from "@/components/LogPanel";
import { OutputPanel } from "@/components/OutputPanel";
import { FileUploadZone } from "@/components/FileUploadZone";
import { FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

type StepStatus = "pending" | "active" | "completed" | "error";

interface ProcessState {
  scraping: StepStatus;
  extracting: StepStatus;
  summarizing: StepStatus;
  generating: StepStatus;
  errorMessage?: string;
}

const Index = () => {
  const { toast } = useToast();
  const [articleUrl, setArticleUrl] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processState, setProcessState] = useState<ProcessState>({
    scraping: "pending",
    extracting: "pending",
    summarizing: "pending",
    generating: "pending",
  });
  const [isComplete, setIsComplete] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  const steps = [
    { key: "scraping" as const, title: "Scraping Article" },
    { key: "extracting" as const, title: "Extracting Data" },
    { key: "summarizing" as const, title: "Summarizing Findings" },
    { key: "generating" as const, title: "Generating PowerPoint" },
  ];

  const simulateProcess = async () => {
    setIsProcessing(true);
    setIsComplete(false);
    setShowLogs(true);

    for (const step of steps) {
      setProcessState((prev) => ({ ...prev, [step.key]: "active" }));

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate random error (10% chance)
      if (Math.random() < 0.1) {
        setProcessState((prev) => ({
          ...prev,
          [step.key]: "error",
          errorMessage: `Failed to ${step.title.toLowerCase()}. Please try again.`,
        }));
        setIsProcessing(false);
        toast({
          title: "Processing Failed",
          description: `Failed at step: ${step.title}`,
          variant: "destructive",
        });
        return;
      }

      setProcessState((prev) => ({ ...prev, [step.key]: "completed" }));
    }

    setIsProcessing(false);
    setIsComplete(true);
    toast({
      title: "Success!",
      description: "Your graphical abstract has been generated.",
    });
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

    setProcessState({
      scraping: "pending",
      extracting: "pending",
      summarizing: "pending",
      generating: "pending",
    });

    simulateProcess();
  };

  const handleDownload = () => {
    toast({
      title: "Downloading...",
      description: "Your PowerPoint presentation will download shortly.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-foreground">Research Assistant</h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered graphical abstract generator for clinical trials
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
                    Article URL
                  </label>
                  <Input
                    id="article-url"
                    type="url"
                    placeholder="https://jamanetwork.com/journals/jama/article/..."
                    value={articleUrl}
                    onChange={(e) => setArticleUrl(e.target.value)}
                    disabled={isProcessing || !!uploadedFile}
                  />
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
                  disabled={isProcessing || (!articleUrl && !uploadedFile)}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Generate Abstract"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Log Panel - Expands down when processing starts */}
            <LogPanel processState={processState} isExpanded={showLogs} />
          </div>

          {/* Right Column - Output Panel */}
          <div className="lg:col-span-1">
            <OutputPanel isVisible={isComplete} onDownload={handleDownload} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;

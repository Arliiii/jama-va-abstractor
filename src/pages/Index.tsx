import { useState } from "react";
import { Search, Database, FileText, Download, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProgressStep } from "@/components/ProgressStep";
import { FileUploadZone } from "@/components/FileUploadZone";
import { useToast } from "@/hooks/use-toast";

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

  const steps = [
    { key: "scraping" as const, icon: Search, title: "Scraping Article" },
    { key: "extracting" as const, icon: Database, title: "Extracting Data" },
    { key: "summarizing" as const, icon: FileText, title: "Summarizing Findings" },
    { key: "generating" as const, icon: Download, title: "Generating PowerPoint" },
  ];

  const simulateProcess = async () => {
    setIsProcessing(true);
    setIsComplete(false);

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
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-foreground">Graphical Abstract Generator</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Convert JAMA clinical trials into VA-format summaries
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle>Input Article</CardTitle>
              <CardDescription>
                Provide a JAMA article link or upload a PDF file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                  <div className="border rounded-lg p-4 bg-accent">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-primary" />
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
                {isProcessing ? "Generating..." : "Generate Abstract"}
              </Button>
            </CardContent>
          </Card>

          {/* Progress Section */}
          {isProcessing && (
            <Card>
              <CardHeader>
                <CardTitle>Processing</CardTitle>
                <CardDescription>Please wait while we generate your abstract</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-6">
                  {steps.map((step) => (
                    <ProgressStep
                      key={step.key}
                      icon={step.icon}
                      title={step.title}
                      status={processState[step.key]}
                      errorMessage={
                        processState[step.key] === "error" ? processState.errorMessage : undefined
                      }
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Banner */}
          {Object.values(processState).includes("error") && (
            <Card className="border-destructive bg-destructive/10">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-destructive">Processing Failed</h3>
                    <p className="text-sm text-destructive/90 mt-1">
                      {processState.errorMessage || "An error occurred during processing."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success Section */}
          {isComplete && (
            <Card className="border-success bg-success/10">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-8 h-8 text-success" />
                    <div>
                      <h3 className="font-medium text-success-foreground">
                        Abstract Generated Successfully!
                      </h3>
                      <p className="text-sm text-success-foreground/80 mt-1">
                        Your VA-format summary is ready to download.
                      </p>
                    </div>
                  </div>
                  <Button onClick={handleDownload} className="gap-2">
                    <Download className="w-4 h-4" />
                    Download PPT
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;

import { useState } from "react";
import { InputCard } from "@/components/InputCard";
import { StatusCard } from "@/components/StatusCard";
import { ResultsCard } from "@/components/ResultsCard";
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
    { key: "scraping" as const, title: "Scraping Article" },
    { key: "extracting" as const, title: "Extracting Data" },
    { key: "summarizing" as const, title: "Summarizing Findings" },
    { key: "generating" as const, title: "Generating PowerPoint" },
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
      <header className="border-b bg-card shadow-sm">
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
          {/* Input Card */}
          <InputCard
            articleUrl={articleUrl}
            onUrlChange={setArticleUrl}
            uploadedFile={uploadedFile}
            onFileSelect={setUploadedFile}
            onFileRemove={() => setUploadedFile(null)}
            onGenerate={handleGenerate}
            isProcessing={isProcessing}
          />

          {/* Status Card - Only show when processing */}
          {isProcessing && <StatusCard processState={processState} />}

          {/* Results Card - Slide in when complete */}
          {isComplete && <ResultsCard onDownload={handleDownload} />}
        </div>
      </main>
    </div>
  );
};

export default Index;

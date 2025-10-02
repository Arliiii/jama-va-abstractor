import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogRow } from "./LogRow";
import { Search, Database, FileText, Download } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef } from "react";

type StepStatus = "pending" | "active" | "completed" | "error";

interface ProcessState {
  scraping: StepStatus;
  extracting: StepStatus;
  summarizing: StepStatus;
  generating: StepStatus;
  errorMessage?: string;
}

interface LogPanelProps {
  processState: ProcessState;
  isExpanded: boolean;
}

export const LogPanel = ({ processState, isExpanded }: LogPanelProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const steps = [
    { key: "scraping" as const, icon: Search, title: "Scraping article from JAMA database" },
    { key: "extracting" as const, icon: Database, title: "Extracting clinical trial data" },
    { key: "summarizing" as const, icon: FileText, title: "Summarizing findings with AI" },
    { key: "generating" as const, icon: Download, title: "Generating PowerPoint presentation" },
  ];

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", { 
      hour: "2-digit", 
      minute: "2-digit", 
      second: "2-digit",
      hour12: false 
    });
  };

  // Auto-scroll to bottom when new logs appear
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [processState]);

  if (!isExpanded) return null;

  return (
    <Card className="transition-all duration-500 ease-out overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Processing Log</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4" ref={scrollRef}>
          <div className="space-y-2">
            {steps.map((step) => (
              <LogRow
                key={step.key}
                icon={step.icon}
                title={step.title}
                status={processState[step.key]}
                errorMessage={
                  processState[step.key] === "error" ? processState.errorMessage : undefined
                }
                timestamp={getCurrentTime()}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

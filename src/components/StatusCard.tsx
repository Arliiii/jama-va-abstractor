import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";
import { StatusAccordionItem } from "./StatusAccordionItem";
import { Search, Database, FileText, Download } from "lucide-react";

type StepStatus = "pending" | "active" | "completed" | "error";

interface ProcessState {
  scraping: StepStatus;
  extracting: StepStatus;
  summarizing: StepStatus;
  generating: StepStatus;
  errorMessage?: string;
}

interface StatusCardProps {
  processState: ProcessState;
}

export const StatusCard = ({ processState }: StatusCardProps) => {
  const steps = [
    {
      key: "scraping" as const,
      icon: Search,
      title: "Scraping Article",
      details: "Fetching article content from JAMA database...",
    },
    {
      key: "extracting" as const,
      icon: Database,
      title: "Extracting Data",
      details: "Parsing clinical trial data and metadata...",
    },
    {
      key: "summarizing" as const,
      icon: FileText,
      title: "Summarizing Findings",
      details: "Generating VA-format summary using AI...",
    },
    {
      key: "generating" as const,
      icon: Download,
      title: "Generating PowerPoint",
      details: "Creating PowerPoint presentation with graphics...",
    },
  ];

  // Get the currently active or error step for default open
  const activeStep = steps.find(
    (step) => processState[step.key] === "active" || processState[step.key] === "error"
  );

  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle>Processing Pipeline</CardTitle>
        <CardDescription>Track the progress of each processing step</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion
          type="single"
          collapsible
          defaultValue={activeStep?.key}
          value={activeStep?.key}
        >
          {steps.map((step) => (
            <StatusAccordionItem
              key={step.key}
              value={step.key}
              icon={step.icon}
              title={step.title}
              status={processState[step.key]}
              errorMessage={
                processState[step.key] === "error" ? processState.errorMessage : undefined
              }
              details={step.details}
            />
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle2 } from "lucide-react";

interface SummaryField {
  label: string;
  value: string;
}

interface ResultsCardProps {
  onDownload: () => void;
}

const summaryFields: SummaryField[] = [
  {
    label: "Study Type",
    value: "Randomized Clinical Trial",
  },
  {
    label: "Participants",
    value: "N=1,234 patients",
  },
  {
    label: "Primary Outcome",
    value: "Reduction in cardiovascular events",
  },
  {
    label: "Key Finding",
    value: "27% relative risk reduction (p<0.001)",
  },
];

export const ResultsCard = ({ onDownload }: ResultsCardProps) => {
  return (
    <Card className="animate-slide-in transition-all duration-300 hover:shadow-xl border-success bg-success/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 text-success" />
          <div>
            <CardTitle className="text-success-foreground">
              Abstract Generated Successfully!
            </CardTitle>
            <CardDescription className="text-success-foreground/80">
              Your VA-format summary is ready to download
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summaryFields.map((field, index) => (
            <Card
              key={field.label}
              className="animate-flip-in border-border/50 hover:shadow-md transition-all duration-200"
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <CardContent className="pt-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  {field.label}
                </p>
                <p className="text-sm font-medium text-foreground">{field.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Download Button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={onDownload}
            size="lg"
            className="gap-2 animate-pulse-gentle hover:animate-none transition-all duration-200"
          >
            <Download className="w-5 h-5" />
            Download PowerPoint
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

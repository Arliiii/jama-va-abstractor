import { LucideIcon, Loader2, CheckCircle2, XCircle } from "lucide-react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

type StepStatus = "pending" | "active" | "completed" | "error";

interface StatusAccordionItemProps {
  value: string;
  icon: LucideIcon;
  title: string;
  status: StepStatus;
  errorMessage?: string;
  details?: string;
}

export const StatusAccordionItem = ({
  value,
  icon: Icon,
  title,
  status,
  errorMessage,
  details = "Processing step in progress...",
}: StatusAccordionItemProps) => {
  const getStatusIcon = () => {
    switch (status) {
      case "active":
        return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case "error":
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-muted" />;
    }
  };

  return (
    <AccordionItem value={value} className="border-b">
      <AccordionTrigger
        className={cn(
          "hover:no-underline transition-all duration-200",
          status === "active" && "bg-accent/50",
          status === "completed" && "bg-success/10",
          status === "error" && "bg-destructive/10"
        )}
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="transition-transform duration-200 hover:scale-110">
            {getStatusIcon()}
          </div>
          <Icon
            className={cn(
              "w-5 h-5 transition-all duration-200",
              status === "pending" && "text-muted-foreground",
              status === "active" && "text-primary",
              status === "completed" && "text-success",
              status === "error" && "text-destructive"
            )}
          />
          <span
            className={cn(
              "font-medium transition-colors",
              status === "pending" && "text-muted-foreground",
              status === "active" && "text-primary",
              status === "completed" && "text-success",
              status === "error" && "text-destructive"
            )}
          >
            {title}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 py-4 text-sm text-muted-foreground">
        {status === "error" && errorMessage ? (
          <p className="text-destructive">{errorMessage}</p>
        ) : status === "completed" ? (
          <p className="text-success">Step completed successfully!</p>
        ) : (
          <p>{details}</p>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

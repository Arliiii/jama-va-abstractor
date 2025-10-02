import { LucideIcon, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type StepStatus = "pending" | "active" | "completed" | "error";

interface LogRowProps {
  icon: LucideIcon;
  title: string;
  status: StepStatus;
  errorMessage?: string;
  timestamp: string;
}

export const LogRow = ({ icon: Icon, title, status, errorMessage, timestamp }: LogRowProps) => {
  const [shouldShake, setShouldShake] = useState(false);

  useEffect(() => {
    if (status === "error") {
      setShouldShake(true);
      const timer = setTimeout(() => setShouldShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const getStatusIcon = () => {
    switch (status) {
      case "active":
        return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "error":
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />;
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg transition-all duration-300",
        status === "active" && "bg-accent/50",
        status === "completed" && "bg-success/5",
        status === "error" && "bg-destructive/5",
        shouldShake && "animate-shake"
      )}
    >
      <div className="flex-shrink-0 mt-0.5">{getStatusIcon()}</div>
      
      <Icon
        className={cn(
          "w-4 h-4 flex-shrink-0 mt-0.5 transition-colors",
          status === "pending" && "text-muted-foreground",
          status === "active" && "text-primary",
          status === "completed" && "text-success",
          status === "error" && "text-destructive"
        )}
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              "text-sm font-medium transition-colors",
              status === "pending" && "text-muted-foreground",
              status === "active" && "text-primary",
              status === "completed" && "text-success",
              status === "error" && "text-destructive"
            )}
          >
            {title}
          </p>
          <span className="text-xs text-muted-foreground flex-shrink-0">{timestamp}</span>
        </div>
        
        {status === "error" && errorMessage && (
          <p className="text-xs text-destructive mt-1 animate-fade-in">{errorMessage}</p>
        )}
        
        {status === "completed" && (
          <p className="text-xs text-success/80 mt-1">Completed successfully</p>
        )}
        
        {status === "active" && (
          <p className="text-xs text-primary/80 mt-1">Processing...</p>
        )}
      </div>
    </div>
  );
};

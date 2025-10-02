import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressStepProps {
  icon: LucideIcon;
  title: string;
  status: "pending" | "active" | "completed" | "error";
  errorMessage?: string;
}

export const ProgressStep = ({ icon: Icon, title, status, errorMessage }: ProgressStepProps) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
          status === "pending" && "bg-muted",
          status === "active" && "bg-primary animate-pulse",
          status === "completed" && "bg-success",
          status === "error" && "bg-destructive"
        )}
      >
        <Icon
          className={cn(
            "w-8 h-8 transition-colors",
            status === "pending" && "text-muted-foreground",
            (status === "active" || status === "completed" || status === "error") && "text-white"
          )}
        />
      </div>
      <div className="text-center">
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
        {status === "error" && errorMessage && (
          <p className="text-xs text-destructive mt-1">{errorMessage}</p>
        )}
      </div>
    </div>
  );
};

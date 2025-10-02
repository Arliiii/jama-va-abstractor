import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileUploadZone } from "./FileUploadZone";
import { FileText } from "lucide-react";

interface InputCardProps {
  articleUrl: string;
  onUrlChange: (url: string) => void;
  uploadedFile: File | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  onGenerate: () => void;
  isProcessing: boolean;
}

export const InputCard = ({
  articleUrl,
  onUrlChange,
  uploadedFile,
  onFileSelect,
  onFileRemove,
  onGenerate,
  isProcessing,
}: InputCardProps) => {
  const [isUrlFocused, setIsUrlFocused] = useState(false);

  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
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
          <div
            className={`transition-all duration-200 rounded-lg ${
              isUrlFocused ? "ring-2 ring-primary ring-offset-2" : ""
            }`}
          >
            <Input
              id="article-url"
              type="url"
              placeholder="https://jamanetwork.com/journals/jama/article/..."
              value={articleUrl}
              onChange={(e) => onUrlChange(e.target.value)}
              onFocus={() => setIsUrlFocused(true)}
              onBlur={() => setIsUrlFocused(false)}
              disabled={isProcessing || !!uploadedFile}
              className="transition-all duration-200"
            />
          </div>
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
            <div className="border rounded-lg p-4 bg-accent transition-all duration-200 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-primary transition-transform duration-200 hover:scale-110" />
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
                  onClick={onFileRemove}
                  disabled={isProcessing}
                >
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <FileUploadZone onFileSelect={onFileSelect} />
          )}
        </div>

        <Button
          onClick={onGenerate}
          disabled={isProcessing || (!articleUrl && !uploadedFile)}
          className="w-full transition-all duration-200 hover:scale-105"
          size="lg"
        >
          {isProcessing ? "Generating..." : "Generate Abstract"}
        </Button>
      </CardContent>
    </Card>
  );
};

import { useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
}

export const FileUploadZone = ({ onFileSelect }: FileUploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0].type === "application/pdf") {
      onFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 group cursor-pointer overflow-hidden",
        isDragging
          ? "border-primary bg-gradient-to-br from-slate-800 to-slate-700 scale-105 shadow-lg"
          : "border-slate-600 bg-gradient-to-br from-slate-800 to-slate-900 hover:border-primary/60 hover:bg-gradient-to-br hover:from-slate-700 hover:to-slate-800 hover:scale-102"
      )}
    >
      {/* Background animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Upload icon with animation */}
      <div className="relative z-10">
        <div className={cn(
          "w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center transition-all duration-300",
          isDragging 
            ? "bg-gradient-to-br from-blue-400 to-indigo-500 text-white scale-110 shadow-lg" 
            : "bg-gradient-to-br from-slate-600 to-slate-700 text-slate-300 group-hover:from-blue-400 group-hover:to-indigo-500 group-hover:text-white group-hover:scale-110"
        )}>
          <Upload className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <p className="text-base font-medium text-slate-200">
            Drag and drop your PDF here
          </p>
          <p className="text-sm text-slate-400">
            or
          </p>
          <label className="inline-block">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileInput}
              className="hidden"
            />
            <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-lg cursor-pointer hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105">
              Browse Files
            </span>
          </label>
        </div>
        
        <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-slate-400">
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
          <span>PDF files only</span>
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
          <span>Max 10MB</span>
        </div>
      </div>
    </div>
  );
};

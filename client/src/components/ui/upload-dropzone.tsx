import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UploadCloud } from "lucide-react";

interface UploadDropzoneProps {
  onSelectFiles: () => void;
  onFilesDropped: (files: File[]) => void;
  isActive?: boolean;
}

export function UploadDropzone({ 
  onSelectFiles, 
  onFilesDropped, 
  isActive = false 
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesDropped(Array.from(e.dataTransfer.files));
    }
  }, [onFilesDropped]);

  return (
    <div 
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
        isDragging ? "border-primary bg-blue-50" : "border-gray-300 hover:bg-gray-50",
        isActive && "border-primary bg-blue-50"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={onSelectFiles}
    >
      <UploadCloud className="h-10 w-10 text-gray-400 mx-auto mb-2" />
      <p className="text-gray-600 mb-2">Drag and drop images here, or click to browse</p>
      <p className="text-sm text-gray-500">Supported formats: JPG, PNG, GIF</p>
      <Button className="mt-4" onClick={(e) => { 
        e.stopPropagation(); 
        onSelectFiles();
      }}>
        Browse Files
      </Button>
    </div>
  );
}

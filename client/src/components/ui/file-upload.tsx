import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, UploadCloud } from "lucide-react";
import { UploadDropzone } from "./upload-dropzone";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onUploadComplete: (images: { name: string; data: string }[]) => void;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    await processFiles(Array.from(files));
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDropzoneFiles = async (files: File[]) => {
    await processFiles(files);
  };

  const processFiles = async (files: File[]) => {
    if (files.length === 0) return;

    // Validate files
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length === 0) {
      toast({
        title: "無效檔案",
        description: "請只上傳圖片檔案",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setProgress(0);
    
    const uploadedImages: { name: string; data: string }[] = [];
    let processed = 0;

    for (const file of validFiles) {
      try {
        const base64 = await convertFileToBase64(file);
        uploadedImages.push({
          name: file.name,
          data: base64
        });
        
        processed++;
        setProgress(Math.floor((processed / validFiles.length) * 100));
      } catch (error) {
        console.error("Error processing file:", file.name, error);
      }
    }

    // Artificial delay to show progress
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setIsUploading(false);
    onUploadComplete(uploadedImages);
    
    toast({
      title: "上傳完成",
      description: `已成功上傳 ${uploadedImages.length} 張圖片`,
    });
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800">上傳圖片</CardTitle>
      </CardHeader>
      <CardContent>
        <input 
          type="file" 
          ref={fileInputRef}
          multiple 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange}
        />
        
        <UploadDropzone 
          onSelectFiles={() => fileInputRef.current?.click()}
          onFilesDropped={handleDropzoneFiles}
          isActive={isUploading}
        />
        
        {isUploading && (
          <div className="mt-4 flex items-center">
            <Progress value={progress} className="flex-1 h-2.5" />
            <span className="ml-4 text-sm text-gray-600 min-w-[40px]">{progress}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

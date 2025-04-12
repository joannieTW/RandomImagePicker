import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FileUpload } from "@/components/ui/file-upload";
import { ImageGallery } from "@/components/image-gallery";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Image } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [uploadComplete, setUploadComplete] = useState(false);
  const { toast } = useToast();

  // Fetch images
  const { data: images, isLoading } = useQuery<Image[]>({
    queryKey: ['/api/images'],
    refetchOnWindowFocus: true,
  });

  // Upload images mutation
  const uploadMutation = useMutation({
    mutationFn: async (imageData: { images: { name: string; data: string }[] }) => {
      const res = await apiRequest('POST', '/api/images', imageData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/images'] });
      setUploadComplete(true);
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your images. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleUploadComplete = (uploadedImages: { name: string; data: string }[]) => {
    if (uploadedImages.length > 0) {
      uploadMutation.mutate({ images: uploadedImages });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-semibold text-gray-800 mb-2">隨機圖片選擇器</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          上傳多張圖片並隨機選擇一張。每張圖片只能被選擇一次。
        </p>
      </header>

      <main className="space-y-8">
        <FileUpload onUploadComplete={handleUploadComplete} />
        
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>
        ) : (
          <>{images && <ImageGallery images={images} />}</>
        )}
      </main>

      <footer className="mt-12 text-center text-gray-500 text-sm pb-8">
        <p>隨機圖片選擇器 &copy; {new Date().getFullYear()} - 公平無偏的選擇工具</p>
      </footer>
    </div>
  );
}

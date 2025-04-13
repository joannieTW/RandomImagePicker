import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FileUpload } from "@/components/ui/file-upload";
import { ImageGallery } from "@/components/image-gallery";
import { GroupSelector } from "@/components/group-selector";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Image } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { UploadCloud } from "lucide-react";

export default function Home() {
  const [uploadComplete, setUploadComplete] = useState(false);
  const [activeGroup, setActiveGroup] = useState<number>(0);
  const [totalGroups, setTotalGroups] = useState<number>(1);
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
          上傳多張圖片並隨機選擇一張。每張圖片只能被選擇一次。可以將圖片分成多組進行抽取。
        </p>
      </header>

      <main className="space-y-8">
        {/* 根據有無圖片決定上傳區塊的顯示方式 */}
        {(!images || images.length === 0) ? (
          <FileUpload onUploadComplete={handleUploadComplete} />
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 transition-all hover:border-gray-300">
            <details className="cursor-pointer">
              <summary className="text-sm font-medium text-gray-700 flex items-center justify-between">
                <div className="flex items-center">
                  <UploadCloud className="h-4 w-4 mr-2 text-gray-500" />
                  想再上傳更多圖片？點擊此處展開上傳區域
                </div>
                <div className="text-xs text-gray-500">已上傳 {images.length} 張圖片</div>
              </summary>
              <div className="mt-4">
                <FileUpload onUploadComplete={handleUploadComplete} />
              </div>
            </details>
          </div>
        )}
        
        {/* 分組選擇器 */}
        {images && images.length > 0 && (
          <div className="mt-2 mb-4">
            <h2 className="text-lg font-medium text-gray-800 mb-3">選擇分組方式：</h2>
            <GroupSelector 
              onGroupsChange={(groups) => setTotalGroups(groups)} 
              disabled={isLoading}
            />
          </div>
        )}
        
        {/* 圖片展示與選擇區域 */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>
        ) : (
          <>{images && images.length > 0 && (
            <>
              {images.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                  <p className="text-blue-700 text-sm flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>點擊「隨機選擇圖片」按鈕開始抽取。每張圖片只能被抽取一次。</span>
                  </p>
                </div>
              )}
              <ImageGallery 
                images={images} 
                activeGroup={activeGroup} 
                totalGroups={totalGroups}
              />
            </>
          )}</>
        )}
      </main>

      <footer className="mt-12 text-center text-gray-500 text-sm pb-8">
        <p>隨機圖片選擇器 &copy; {new Date().getFullYear()} - 公平無偏的選擇工具</p>
      </footer>
    </div>
  );
}

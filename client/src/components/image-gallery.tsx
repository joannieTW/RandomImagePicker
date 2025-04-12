import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Shuffle, RotateCcw } from "lucide-react";
import { SelectionStatus } from "./selection-status";
import { RecentSelection } from "./recent-selection";
import { CompletionState } from "./completion-state";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Image } from "@shared/schema";

interface ImageGalleryProps {
  images: Image[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [recentlySelected, setRecentlySelected] = useState<Image | null>(null);
  const { toast } = useToast();

  const selectImageMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('PATCH', `/api/images/${id}/select`, undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/images'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to select image",
        variant: "destructive"
      });
    }
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/images/reset', undefined);
      return res.json();
    },
    onSuccess: () => {
      setRecentlySelected(null);
      queryClient.invalidateQueries({ queryKey: ['/api/images'] });
      toast({
        title: "Reset complete",
        description: "All images are now available again"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reset selection",
        variant: "destructive"
      });
    }
  });

  const selectRandomImage = () => {
    // Get all unselected images
    const unselectedImages = images.filter(img => !img.selected);
    
    if (unselectedImages.length === 0) {
      toast({
        title: "No images available",
        description: "All images have been selected. Reset to start over."
      });
      return;
    }
    
    // Pick a random image
    const randomIndex = Math.floor(Math.random() * unselectedImages.length);
    const selectedImage = unselectedImages[randomIndex];
    
    // Update the selection state
    selectImageMutation.mutate(selectedImage.id);
    setRecentlySelected(selectedImage);
  };

  const handleReset = () => {
    resetMutation.mutate();
  };

  // Check if all images are selected
  const allSelected = images.length > 0 && images.every(img => img.selected);
  
  // Check if no images are uploaded yet
  const noImages = images.length === 0;

  if (allSelected) {
    return <CompletionState onRestart={handleReset} />;
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold text-gray-800">您的图片</CardTitle>
        <div className="flex gap-2">
          <Button 
            onClick={selectRandomImage} 
            disabled={noImages || selectImageMutation.isPending}
          >
            <Shuffle className="mr-2 h-4 w-4" /> 随机选择图片
          </Button>
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={resetMutation.isPending}
          >
            <RotateCcw className="mr-2 h-4 w-4" /> 重置
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <SelectionStatus 
          totalCount={images.length} 
          selectedCount={images.filter(img => img.selected).length}
        />
        
        {recentlySelected && (
          <RecentSelection image={recentlySelected} />
        )}
        
        {noImages ? (
          <div className="py-12 text-center">
            <div className="text-4xl text-gray-400 mb-2">🖼️</div>
            <p className="text-gray-600">尚未上传图片</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
            {images.map((image) => (
              <div 
                key={image.id} 
                className={cn(
                  "relative rounded-lg overflow-hidden bg-gray-100 aspect-square transition-all hover:shadow-lg",
                  image.selected ? "" : "hover:-translate-y-1"
                )}
              >
                <img 
                  src={image.data} 
                  alt={image.name} 
                  className="w-full h-full object-cover"
                />
                
                {image.selected && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center p-2">
                    <div className="rounded-full bg-white w-10 h-10 flex items-center justify-center mb-2">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-white text-sm font-medium">Selected</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Shuffle, RotateCcw, Trash2 } from "lucide-react";
import { SelectionStatus } from "./selection-status";
import { RecentSelection } from "./recent-selection";
import { CompletionState } from "./completion-state";
import { CardRevealModal } from "./card-reveal-modal";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Image } from "@shared/schema";

interface ImageGalleryProps {
  images: Image[];
  activeGroup?: number;
  totalGroups?: number;
}

export function ImageGallery({ 
  images, 
  activeGroup = 0, 
  totalGroups = 1 
}: ImageGalleryProps) {
  const [recentlySelected, setRecentlySelected] = useState<Image | null>(null);
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<number>(activeGroup);
  const { toast } = useToast();

  const selectImageMutation = useMutation({
    mutationFn: async (params: { id: number, groupId: number }) => {
      const { id, groupId } = params;
      const res = await apiRequest('PATCH', `/api/images/${id}/select?groupId=${groupId}`, undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/images'] });
    },
    onError: () => {
      toast({
        title: "錯誤",
        description: "無法選擇圖片",
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
        title: "重置完成",
        description: "已清空所有圖片，可以重新開始了"
      });
    },
    onError: () => {
      toast({
        title: "錯誤",
        description: "無法重置選擇",
        variant: "destructive"
      });
    }
  });
  
  // 刪除單張圖片
  const deleteImageMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/images/${id}`, undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/images'] });
      toast({
        title: "刪除成功",
        description: "已刪除該圖片"
      });
    },
    onError: () => {
      toast({
        title: "錯誤",
        description: "無法刪除圖片",
        variant: "destructive"
      });
    }
  });

  const selectRandomImage = () => {
    let filteredImages;
    
    // 允許從所有卡片中抽取，確保即使卡片數量少於組別數，也能完成所有組別
    filteredImages = images.filter(img => {
      // 如果選擇了特定組別，只考慮尚未被當前組別選擇過的卡片
      if (selectedGroup > 0) {
        // 檢查此卡片是否已被此組別抽取過
        const isSelectedByCurrentGroup = (img.group_id ?? 0) === selectedGroup;
        // 檢查此卡片還能否被選擇（總次數小於1）
        const canBeSelected = (img.selected_count ?? 0) < 1;
        // 如果卡片尚未被當前組別抽取過且總抽取次數未達到上限，則可以選擇
        return !isSelectedByCurrentGroup && canBeSelected;
      } else {
        // 從所有卡片中抽取（每張只能抽1次）
        return (img.selected_count ?? 0) < 1;
      }
    });
    
    // 如果沒有符合條件的卡片，檢查是否有任何可用卡片
    if (filteredImages.length === 0) {
      // 嘗試查找任何未達到抽取上限的卡片
      const anyAvailableCards = images.filter(img => (img.selected_count ?? 0) < 1);
      
      if (anyAvailableCards.length > 0 && selectedGroup > 0) {
        // 如果還有可用卡片但當前組別沒有可用卡片，自動切換到下一組
        selectNextGroup();
        toast({
          title: "已切換到下一組",
          description: `組別 ${selectedGroup} 中所有卡片已抽完，已自動切換到組別 ${selectedGroup + 1 > totalGroups ? 1 : selectedGroup + 1}`
        });
        return;
      } else {
        // 如果沒有任何可用卡片
        toast({
          title: "沒有可用圖片",
          description: selectedGroup > 0 
            ? `組別 ${selectedGroup} 中沒有可用圖片，所有卡片已被抽取一次。請重置或選擇其他組別。`
            : "所有圖片已被抽取一次。請重置以重新開始。"
        });
        return;
      }
    }
    
    // 隨機選擇一張圖片
    const randomIndex = Math.floor(Math.random() * filteredImages.length);
    const selectedImage = filteredImages[randomIndex];
    
    // 更新選擇狀態並指定組別
    selectImageMutation.mutate({
      id: selectedImage.id,
      groupId: selectedGroup
    }, {
      onSuccess: (updatedImage) => {
        // 更新最近選擇的圖片，確保有最新的selected_count值
        setRecentlySelected(updatedImage);
        
        // 在抽取成功後，檢查該組別是否還有卡片可抽
        const remainingCardsInGroup = images.filter(img => {
          const groupMatch = selectedGroup === 0 || (img.group_id ?? 0) === selectedGroup || (img.group_id ?? 0) === 0;
          const canSelect = (img.selected_count ?? 0) < 1 && img.id !== selectedImage.id;
          return groupMatch && canSelect;
        });
        
        // 如果該組別沒有更多卡片可抽，自動切換到下一組
        if (remainingCardsInGroup.length === 0 && totalGroups > 1 && selectedGroup > 0) {
          // 延遲切換到下一組，確保使用者能看到當前抽取結果
          setTimeout(() => {
            selectNextGroup();
            toast({
              title: "已切換到下一組",
              description: `組別 ${selectedGroup} 中所有卡片已抽完，已自動切換到組別 ${selectedGroup + 1 > totalGroups ? 1 : selectedGroup + 1}`
            });
          }, 1500);
        }
      }
    });
    
    // 先設置為初始狀態，彈窗中會顯示正確的結果
    setRecentlySelected(selectedImage);
    
    // 顯示彈出視窗
    setShowRevealModal(true);
  };

  const handleReset = () => {
    resetMutation.mutate();
  };

  // 處理組別切換
  const handleGroupChange = (groupId: number) => {
    setSelectedGroup(groupId);
  };

  // 依序從第一組到最後一組抽取
  const selectNextGroup = () => {
    // 如果目前選擇的是全部(0)或最後一組，則下一組是第1組
    if (selectedGroup === 0 || selectedGroup >= totalGroups) {
      setSelectedGroup(1);
    } else {
      // 否則選擇下一組
      setSelectedGroup(selectedGroup + 1);
    }
  };
  
  // 生成組別標籤
  const generateGroupTabs = () => {
    if (totalGroups <= 1) return null;
    
    const tabs = [];
    // 添加"全部"選項
    tabs.push(
      <Button 
        key="all"
        variant={selectedGroup === 0 ? "default" : "outline"}
        className={`px-4 rounded-full ${selectedGroup === 0 ? "bg-primary" : ""}`}
        onClick={() => handleGroupChange(0)}
      >
        全部
      </Button>
    );
    
    // 添加各個組別標籤
    for (let i = 1; i <= totalGroups; i++) {
      tabs.push(
        <Button 
          key={i}
          variant={selectedGroup === i ? "default" : "outline"}
          className={`px-4 rounded-full ${selectedGroup === i ? "bg-primary" : ""}`}
          onClick={() => handleGroupChange(i)}
        >
          組別 {i}
        </Button>
      );
    }
    
    return (
      <div className="flex flex-wrap gap-2 mb-4 mt-2">
        {tabs}
      </div>
    );
  };
  
  // 是否所有圖片都已選擇
  const allSelected = images.length > 0 && images.every(img => (img.selected_count ?? 0) >= 1);
  
  // 是否沒有上傳圖片
  const noImages = images.length === 0;

  if (allSelected) {
    return <CompletionState onRestart={handleReset} />;
  }

  return (
    <Card className="w-full">
      {/* Card Reveal Modal */}
      <CardRevealModal 
        image={recentlySelected || undefined}
        open={showRevealModal}
        onClose={() => setShowRevealModal(false)}
      />
      
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold text-gray-800">您的圖片</CardTitle>
        <div className="flex gap-2">
          <Button 
            onClick={selectRandomImage} 
            disabled={noImages || selectImageMutation.isPending}
          >
            <Shuffle className="mr-2 h-4 w-4" /> 隨機選擇圖片
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
          selectedCount={images.filter(img => (img.selected_count ?? 0) > 0).length}
        />
        
        {/* 顯示分組標籤 */}
        {generateGroupTabs()}
        
        {recentlySelected && (
          <RecentSelection image={recentlySelected} />
        )}
        
        {noImages ? (
          <div className="py-12 text-center">
            <div className="text-4xl text-gray-400 mb-2">🖼️</div>
            <p className="text-gray-600">尚未上傳圖片</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
            {images.map((image) => (
              <div 
                key={image.id} 
                className={cn(
                  "relative rounded-lg overflow-hidden bg-gray-100 aspect-square transition-all hover:shadow-lg group",
                  image.selected ? "" : "hover:-translate-y-1"
                )}
              >
                <img 
                  src={image.data} 
                  alt={image.name} 
                  className="w-full h-full object-cover"
                />
                
                {/* 刪除按鈕 */}
                <button
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('確定要刪除此圖片嗎？')) {
                      deleteImageMutation.mutate(image.id);
                    }
                  }}
                  title="刪除圖片"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                
                {/* 顯示卡片抽取狀態 */}
                {(image.selected_count ?? 0) > 0 && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center p-2">
                    <div className="rounded-full bg-white w-10 h-10 flex items-center justify-center mb-2">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-white text-sm font-medium">
                      已抽取 {image.selected_count} 次
                    </span>
                    {(image.group_id ?? 0) > 0 && (
                      <span className="text-white text-xs mt-1 opacity-80">
                        組別 {image.group_id}
                      </span>
                    )}
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

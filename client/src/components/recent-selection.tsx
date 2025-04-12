import { Image } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface RecentSelectionProps {
  image: Image;
}

export function RecentSelection({ image }: RecentSelectionProps) {
  const timeAgo = formatDistanceToNow(new Date(image.timestamp), { addSuffix: true });

  return (
    <div className="mb-6">
      <h3 className="text-md font-medium text-gray-700 mb-3">最近抽到的卡片：</h3>
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center gap-4">
        <div className="h-16 w-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
          <img 
            className="w-full h-full object-cover" 
            src={image.data} 
            alt={image.name} 
          />
        </div>
        <div>
          {/* 移除檔案名稱顯示 */}
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-600">
              抽取時間：{timeAgo}
            </p>
            {(image.group_id ?? 0) > 0 && (
              <span className="inline-block text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                組別 {image.group_id}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            第 {image.selected_count ?? 1} 次抽到
          </p>
        </div>
      </div>
    </div>
  );
}

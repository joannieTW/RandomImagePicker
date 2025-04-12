import { Image } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface RecentSelectionProps {
  image: Image;
}

export function RecentSelection({ image }: RecentSelectionProps) {
  const timeAgo = formatDistanceToNow(new Date(image.timestamp), { addSuffix: true });

  return (
    <div className="mb-6">
      <h3 className="text-md font-medium text-gray-700 mb-3">最近选择：</h3>
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center gap-4">
        <div className="h-16 w-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
          <img 
            className="w-full h-full object-cover" 
            src={image.data} 
            alt={image.name} 
          />
        </div>
        <div>
          <p className="text-gray-800 font-medium">{image.name}</p>
          <p className="text-sm text-gray-600">Selected {timeAgo}</p>
        </div>
      </div>
    </div>
  );
}

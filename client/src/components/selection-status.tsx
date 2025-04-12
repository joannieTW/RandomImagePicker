import { Card } from "@/components/ui/card";

interface SelectionStatusProps {
  totalCount: number;
  selectedCount: number;
}

export function SelectionStatus({ totalCount, selectedCount }: SelectionStatusProps) {
  const remaining = totalCount - selectedCount;
  
  let remainingText = "所有圖片可選";
  if (totalCount > 0) {
    if (remaining === 0) {
      remainingText = "所有圖片已選擇";
    } else if (remaining < totalCount) {
      remainingText = `還剩 ${remaining} 張圖片`;
    }
  }

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
        <span className="font-medium">狀態：</span>
        <span>{selectedCount}</span> / 
        <span>{totalCount}</span> 張圖片已選擇
        <div className="ml-auto">
          <span className="text-primary font-medium">{remainingText}</span>
        </div>
      </div>
    </div>
  );
}

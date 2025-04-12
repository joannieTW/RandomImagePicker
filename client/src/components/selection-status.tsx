import { Card } from "@/components/ui/card";

interface SelectionStatusProps {
  totalCount: number;
  selectedCount: number;
}

export function SelectionStatus({ totalCount, selectedCount }: SelectionStatusProps) {
  const remaining = totalCount - selectedCount;
  
  let remainingText = "All images available";
  if (totalCount > 0) {
    if (remaining === 0) {
      remainingText = "All images selected";
    } else if (remaining < totalCount) {
      remainingText = `${remaining} images remaining`;
    }
  }

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
        <span className="font-medium">Status:</span>
        <span>{selectedCount}</span> of 
        <span>{totalCount}</span> images selected
        <div className="ml-auto">
          <span className="text-primary font-medium">{remainingText}</span>
        </div>
      </div>
    </div>
  );
}

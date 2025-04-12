import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GroupSelectorProps {
  onGroupsChange: (groups: number) => void;
  disabled?: boolean;
}

export function GroupSelector({ onGroupsChange, disabled = false }: GroupSelectorProps) {
  const [groups, setGroups] = useState<number>(1);
  const { toast } = useToast();

  const updateGroups = (newValue: number) => {
    if (newValue < 1) {
      newValue = 1;
    } else if (newValue > 10) {
      newValue = 10;
      toast({
        title: "達到最大限制",
        description: "分組數量不能超過10組",
        variant: "default"
      });
    }
    
    setGroups(newValue);
    onGroupsChange(newValue);
  };

  const incrementGroups = () => {
    updateGroups(groups + 1);
  };

  const decrementGroups = () => {
    updateGroups(groups - 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      updateGroups(value);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold text-gray-800">抽卡分組設置</CardTitle>
        <CardDescription>
          設置要將圖片分成幾組進行抽取。每張卡片最多被抽取2次。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Label htmlFor="groups" className="min-w-24">分組數量:</Label>
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={decrementGroups}
              disabled={groups <= 1 || disabled}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              id="groups"
              type="number"
              value={groups}
              onChange={handleInputChange}
              min={1}
              max={10}
              className="w-16 mx-2 text-center"
              disabled={disabled}
            />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={incrementGroups}
              disabled={groups >= 10 || disabled}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
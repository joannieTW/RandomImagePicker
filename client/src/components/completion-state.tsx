import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, RotateCcw } from "lucide-react";

interface CompletionStateProps {
  onRestart: () => void;
}

export function CompletionState({ onRestart }: CompletionStateProps) {
  return (
    <Card className="w-full">
      <CardContent className="py-8 text-center">
        <div className="rounded-full bg-green-100 w-16 h-16 flex items-center justify-center mb-4 mx-auto">
          <Check className="h-8 w-8 text-green-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">All Images Selected!</h2>
        <p className="text-gray-600 mb-6">You've gone through all your uploaded images.</p>
        <Button onClick={onRestart}>
          <RotateCcw className="mr-2 h-4 w-4" /> Start Over
        </Button>
      </CardContent>
    </Card>
  );
}

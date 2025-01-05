import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const AlertBanner = () => {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <span className="text-sm text-amber-800">
          5 assets require maintenance this week
        </span>
      </div>
      <Button variant="link" className="text-amber-800 text-sm p-0 h-auto">
        View Schedule →
      </Button>
    </div>
  );
};

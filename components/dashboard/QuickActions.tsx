import { Button } from "@/components/ui/button";
import { RefreshCcw, Settings, Shield } from "lucide-react";

export const QuickActions = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Quick Actions</h2>
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start text-gray-700"
        >
          <Shield className="mr-2 h-4 w-4 text-emerald-600" />
          Run Compliance Check
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start text-gray-700"
        >
          <RefreshCcw className="mr-2 h-4 w-4 text-blue-600" />
          Schedule Maintenance
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start text-gray-700"
        >
          <Settings className="mr-2 h-4 w-4 text-amber-600" />
          Configure Settings
        </Button>
      </div>
    </div>
  );
};

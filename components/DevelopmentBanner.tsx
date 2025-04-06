import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const DevelopmentBanner = () => {
  return (
    <Alert
      variant="destructive"
      className="rounded-none border-t-0 border-x-0 bg-yellow-100 border-yellow-300"
    >
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <div>
        <AlertTitle className="font-medium text-yellow-800">
          This application is under development
        </AlertTitle>
        <AlertDescription className="text-yellow-700">
          Scheduled release: End of June 2025
        </AlertDescription>
      </div>
    </Alert>
  );
};

export default DevelopmentBanner;

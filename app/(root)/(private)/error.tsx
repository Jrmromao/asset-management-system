"use client";

import React from "react";
import { AlertTriangle, RefreshCw, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({ reset }: { reset?: () => void }) {
  const handleRetry = () => {
    if (reset) reset();
    else window.location.reload();
  };

  const handleReportIssue = () => {
    const subject = `Error Report - Private Route Error`;
    const body = `\nURL: ${window.location.href}\nTimestamp: ${new Date().toISOString()}\n\nPlease describe what you were doing when this error occurred:\n`;
    const mailtoLink = `mailto:support@yourapp.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, "_blank");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-gray-600 mb-6 text-center">
          We're sorry, but something unexpected happened. Please try again or contact support if the issue persists.
        </p>
        <div className="flex gap-3">
          <Button onClick={handleRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-1" /> Retry
          </Button>
          <Button onClick={handleReportIssue} variant="secondary">
            <MessageCircle className="h-4 w-4 mr-1" /> Report Issue
          </Button>
        </div>
      </div>
    </div>
  );
}

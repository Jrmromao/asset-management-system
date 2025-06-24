"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { BookOpen, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentationToastProps {
  showOnMount?: boolean;
  autoShow?: boolean;
}

export const DocumentationToast: React.FC<DocumentationToastProps> = ({
  showOnMount = false,
  autoShow = false,
}) => {
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if we've already shown the toast in this session
    const hasShownToday = localStorage.getItem("docs-toast-shown");
    const today = new Date().toDateString();

    if ((showOnMount || autoShow) && !hasShown && hasShownToday !== today) {
      const timer = setTimeout(() => {
        showDocumentationToast();
        setHasShown(true);
        localStorage.setItem("docs-toast-shown", today);
      }, 2000); // Show after 2 seconds

      return () => clearTimeout(timer);
    }
  }, [showOnMount, autoShow, hasShown]);

  const showDocumentationToast = () => {
    toast.custom(
      (t) => (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-md">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  📚 New Documentation Available!
                </h4>
                <button
                  onClick={() => toast.dismiss(t)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Master maintenance flows with our comprehensive guides and
                tutorials.
              </p>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => {
                    window.open(
                      "/docs/maintenance-flows-quickstart.md",
                      "_blank",
                    );
                    toast.dismiss(t);
                  }}
                  className="h-7 px-2 text-xs"
                >
                  <BookOpen className="w-3 h-3 mr-1" />
                  Quick Start
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    window.open("/help", "_blank");
                    toast.dismiss(t);
                  }}
                  className="h-7 px-2 text-xs"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View All
                </Button>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        duration: 8000,
        position: "bottom-right",
      },
    );
  };

  // Function to manually trigger the toast
  const triggerToast = () => {
    if (!hasShown) {
      showDocumentationToast();
      setHasShown(true);
    }
  };

  // Return a trigger button if not auto-showing
  if (!showOnMount && !autoShow) {
    return (
      <Button
        onClick={triggerToast}
        variant="outline"
        size="sm"
        className="flex items-center space-x-1"
      >
        <BookOpen className="w-4 h-4" />
        <span>Show Documentation</span>
      </Button>
    );
  }

  return null;
};

export default DocumentationToast;

"use client";

import { useEffect } from "react";

export default function HydrationWarningSuppress() {
  useEffect(() => {
    // Suppress hydration warnings for known browser extension attributes
    const originalError = console.error;
    
    console.error = (...args) => {
      if (
        typeof args[0] === "string" &&
        (args[0].includes("cz-shortcut-listen") ||
         args[0].includes("hydrated but some attributes") ||
         args[0].includes("browser extension"))
      ) {
        return; // Suppress these specific errors
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };    
  }, []);

  return null; // This component doesn't render anything
} 
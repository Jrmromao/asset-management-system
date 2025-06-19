"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function PrivateError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-4 text-red-600">Something went wrong</h1>
      <p className="mb-4 text-gray-700">An unexpected error occurred. Please try again or contact support if the problem persists.</p>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => reset()}
      >
        Reload Page
      </button>
      <pre className="mt-6 p-4 bg-gray-100 rounded text-xs text-gray-500 max-w-xl overflow-x-auto">
        {error.message}
      </pre>
    </div>
  );
} 
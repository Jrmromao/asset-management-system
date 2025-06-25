"use client";

import { useEffect } from "react";
import { useUserMetadataSync } from "@/hooks/useUserMetadataSync";

interface UserMetadataHandlerProps {
  children: React.ReactNode;
  onError?: (error: string) => void;
  onSync?: (companyId: string) => void;
}

export function UserMetadataHandler({
  children,
  onError,
  onSync,
}: UserMetadataHandlerProps) {
  const { handleCompanyNotFoundError } = useUserMetadataSync();

  useEffect(() => {
    // Listen for unhandled errors that might be company-related
    const handleError = async (event: ErrorEvent) => {
      const shouldRetry = await handleCompanyNotFoundError(event.error);

      if (shouldRetry) {
        // Metadata was synced, trigger a page refresh or callback
        if (onSync) {
          // Extract company ID from the synced metadata if available
          const result = await fetch("/api/user/sync-metadata", {
            method: "POST",
          });
          const data = await result.json();
          if (data.success && data.companyId) {
            onSync(data.companyId);
          }
        } else {
          // Default behavior: refresh the page
          window.location.reload();
        }
      } else if (onError) {
        onError(event.error?.message || "Unknown error");
      }
    };

    const handlePromiseRejection = async (event: PromiseRejectionEvent) => {
      const shouldRetry = await handleCompanyNotFoundError(event.reason);

      if (shouldRetry) {
        // Metadata was synced, trigger a page refresh or callback
        if (onSync) {
          const result = await fetch("/api/user/sync-metadata", {
            method: "POST",
          });
          const data = await result.json();
          if (data.success && data.companyId) {
            onSync(data.companyId);
          }
        } else {
          // Default behavior: refresh the page
          window.location.reload();
        }

        // Prevent the error from being logged to console
        event.preventDefault();
      } else if (onError) {
        onError(event.reason?.message || "Unknown error");
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handlePromiseRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handlePromiseRejection);
    };
  }, [handleCompanyNotFoundError, onError, onSync]);

  return <>{children}</>;
}

// Higher-order component version
export function withUserMetadataHandler<P extends object>(
  Component: React.ComponentType<P>,
) {
  return function WrappedComponent(props: P) {
    return (
      <UserMetadataHandler>
        <Component {...props} />
      </UserMetadataHandler>
    );
  };
}

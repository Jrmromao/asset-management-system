import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

interface SyncResult {
  success: boolean;
  message?: string;
  companyId?: string;
  userId?: string;
  synced?: boolean;
  needsRegistration?: boolean;
  error?: string;
}

export function useUserMetadataSync() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const syncUserMetadata = async (): Promise<SyncResult> => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/user/sync-metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.needsRegistration) {
          toast({
            title: "Registration Required",
            description:
              "Please complete your company registration to continue.",
            variant: "destructive",
          });

          // Redirect to registration page
          router.push("/sign-up");

          return {
            success: false,
            needsRegistration: true,
            error: result.error,
          };
        }

        throw new Error(result.error || "Failed to sync metadata");
      }

      if (result.synced) {
        toast({
          title: "Account Synced",
          description: "Your account has been successfully synchronized.",
          variant: "default",
        });
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to sync user metadata";

      toast({
        title: "Sync Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanyNotFoundError = async (
    error: Error | string,
  ): Promise<boolean> => {
    const errorMessage = typeof error === "string" ? error : error.message;

    // Check if this is a company-related error
    if (
      errorMessage.includes("User company not found") ||
      errorMessage.includes("companyId") ||
      errorMessage.includes("company association")
    ) {
      console.log(
        "🔄 Detected company ID issue, attempting to sync metadata...",
      );

      const result = await syncUserMetadata();

      if (result.success && result.synced) {
        // Metadata was synced successfully, return true to indicate the caller should retry
        return true;
      }

      if (result.needsRegistration) {
        // User needs to complete registration, don't retry
        return false;
      }
    }

    // Not a company-related error or sync failed, don't retry
    return false;
  };

  return {
    syncUserMetadata,
    handleCompanyNotFoundError,
    isLoading,
  };
}

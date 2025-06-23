import { useState, useCallback, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

interface ValidationResult {
  exists: boolean;
  available: boolean;
  message: string;
}

interface UseAssetValidationProps {
  type: "assetTag" | "assetName";
  value: string;
  excludeId?: string; // For updates
  debounceMs?: number;
}

export function useAssetValidation({
  type,
  value,
  excludeId,
  debounceMs = 500,
}: UseAssetValidationProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  const validate = useCallback(async () => {
    if (!user || !value.trim()) {
      setValidationResult(null);
      setError(null);
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        type,
        [type === "assetTag" ? "assetTag" : "assetName"]: value,
      });

      if (excludeId) {
        params.append("excludeId", excludeId);
      }

      const response = await fetch(`/api/validate/assets?${params}`);

      if (!response.ok) {
        throw new Error("Validation failed");
      }

      const result: ValidationResult = await response.json();
      setValidationResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Validation error");
      setValidationResult(null);
    } finally {
      setIsValidating(false);
    }
  }, [type, value, excludeId, user]);

  // Debounced validation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validate();
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [validate, debounceMs]);

  return {
    isValidating,
    validationResult,
    error,
    validate, // Manual validation function
  };
}

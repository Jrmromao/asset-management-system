import { useState, useCallback, useEffect, useRef } from "react";

interface ValidationResult {
  isValid: boolean;
  message: string;
  isChecking: boolean;
}

interface UseRealTimeValidationOptions {
  endpoint: string;
  field: string;
  value: string;
  excludeId?: string;
  debounceMs?: number;
  minLength?: number;
  required?: boolean;
}

export function useRealTimeValidation({
  endpoint,
  field,
  value,
  excludeId,
  debounceMs = 500,
  minLength = 2,
  required = true,
}: UseRealTimeValidationOptions): ValidationResult {
  const [result, setResult] = useState<ValidationResult>({
    isValid: true,
    message: "",
    isChecking: false,
  });

  const timeoutRef = useRef<NodeJS.Timeout>();

  const validate = useCallback(
    async (val: string) => {
      // Basic validation
      if (required && !val.trim()) {
        setResult({
          isValid: false,
          message: `${field} is required`,
          isChecking: false,
        });
        return;
      }

      if (val.trim().length < minLength) {
        setResult({
          isValid: false,
          message: `${field} must be at least ${minLength} characters`,
          isChecking: false,
        });
        return;
      }

      // Don't validate if too short
      if (val.trim().length < minLength) {
        setResult({
          isValid: true,
          message: "",
          isChecking: false,
        });
        return;
      }

      setResult((prev) => ({ ...prev, isChecking: true }));

      try {
        const response = await fetch(`/api/validate/${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: val.trim(),
            ...(excludeId && { excludeId }),
          }),
        });

        if (!response.ok) {
          throw new Error("Validation request failed");
        }

        const data = await response.json();

        if (data.exists) {
          setResult({
            isValid: false,
            message: `${field} already exists`,
            isChecking: false,
          });
        } else {
          setResult({
            isValid: true,
            message: "",
            isChecking: false,
          });
        }
      } catch (error) {
        console.error("Validation error:", error);
        setResult({
          isValid: false, // Block submission on error
          message: "Could not validate. Please try again.", // Generic error for user
          isChecking: false,
        });
      }
    },
    [endpoint, field, excludeId, minLength, required],
  );

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced validation
    timeoutRef.current = setTimeout(() => {
      validate(value);
    }, debounceMs);

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, validate, debounceMs]);

  return result;
}

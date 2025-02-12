import { debounce } from "lodash";
import { useState } from "react";

export const useUniqueValidation = () => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const validateField = debounce(
    async (field: string, value: string, endpoint: string) => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
        const response = await fetch(`${baseUrl}${endpoint}`);
        const data = await response.json();

        setValidationErrors((prev) => ({
          ...prev,
          [field]: data.exists ? `This ${field} already exists` : "",
        }));

        return !data.exists;
      } catch (error) {
        console.error(`Validation error for ${field}:`, error);
        return false;
      }
    },
    500,
  );

  return { validateField, validationErrors };
};

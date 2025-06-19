import React from "react";
import { useWatch } from "react-hook-form";
import { cn } from "@/lib/utils";

export const ProgressIndicator = ({
  form,
  requiredFieldsCount,
  requiredFields, // Add this prop to know which fields are required
}: {
  form: any;
  requiredFieldsCount: number;
  requiredFields: string[]; // Array of required field names
}) => {
  const formValues = useWatch({ control: form.control });

  const completedFields = React.useMemo(() => {
    // Only count fields that are in the requiredFields array
    return requiredFields.filter((fieldName) => {
      const value = formValues?.[fieldName];

      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "object" && value !== null) {
        return Object.keys(value).length > 0;
      }
      return value !== undefined && value !== null && value !== "";
    }).length;
  }, [formValues, requiredFields]);

  const percentage = React.useMemo(() => {
    if (!requiredFieldsCount || requiredFieldsCount === 0) return 0;
    return Math.round((completedFields / requiredFieldsCount) * 100) || 0;
  }, [completedFields, requiredFieldsCount]);

  return (
    <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "px-3 py-1 text-xs font-semibold rounded-full transition-colors duration-300",
                form.formState.isValid
                  ? "bg-emerald-50 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  : "bg-amber-50 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
              )}
            >
              {form.formState.isValid
                ? "Ready to submit"
                : "Required fields missing"}
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-gray-200">
              {percentage}%
            </span>
          </div>
          <span className="text-sm text-slate-600 dark:text-gray-400">
            {completedFields} of {requiredFieldsCount} required fields completed
          </span>
        </div>
        <div className="h-1 bg-slate-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-500 ease-out rounded-full",
              percentage === 100
                ? "bg-emerald-500 dark:bg-emerald-400"
                : percentage >= 50
                  ? "bg-blue-500 dark:bg-blue-400"
                  : "bg-amber-500 dark:bg-amber-400",
            )}
            style={{
              width: `${Math.max(0, Math.min(100, percentage))}%`,
              boxShadow: "0 0 8px rgba(59, 130, 246, 0.5)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;

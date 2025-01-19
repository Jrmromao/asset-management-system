import React from "react";

export const ProgressIndicator = ({ form }: { form: any }) => {
  const totalFields = Object.keys(form.getValues()).length;
  const completedFields = Object.keys(form.formState.dirtyFields).length;
  const percentage = Math.round((completedFields / totalFields) * 100);

  return (
    <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors duration-300 ${
                form.formState.isValid
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              {form.formState.isValid
                ? "Ready to submit"
                : "Required fields missing"}
            </div>
            <span className="text-sm font-medium text-slate-700">
              {percentage}%
            </span>
          </div>
          <span className="text-sm text-slate-600">
            {completedFields} of {totalFields} fields completed
          </span>
        </div>
        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ease-out rounded-full ${
              percentage === 100
                ? "bg-emerald-500"
                : percentage >= 50
                  ? "bg-blue-500"
                  : "bg-amber-500"
            }`}
            style={{
              width: `${percentage}%`,
              boxShadow: "0 0 8px rgba(59, 130, 246, 0.5)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;

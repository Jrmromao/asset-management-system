import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, AlertCircle, AlertTriangle } from "lucide-react";
import React from "react";

export type SectionStatus = "complete" | "incomplete" | "error" | "warning";

interface FormSection {
  name: string;
  status: SectionStatus;
}

interface FormProgressProps {
  sections: FormSection[];
}

const statusConfig = {
  complete: {
    icon: (
      <Check
        className="h-3 w-3 text-green-500"
        strokeWidth={2}
        aria-label="Complete"
      />
    ),
    bg: "bg-green-500",
    text: "Complete",
    iconBg: "bg-green-500 text-white",
    textColor: "text-green-700",
  },
  incomplete: {
    icon: (
      <div
        className="h-3 w-3 rounded-full bg-slate-300"
        aria-label="Incomplete"
      />
    ),
    bg: "bg-slate-200",
    text: "Incomplete",
    iconBg: "bg-slate-100",
    textColor: "text-slate-500",
  },
  error: {
    icon: (
      <AlertCircle
        className="h-3 w-3 text-red-500"
        strokeWidth={2}
        aria-label="Error"
      />
    ),
    bg: "bg-red-500",
    text: "Error",
    iconBg: "bg-red-50",
    textColor: "text-red-700",
  },
  warning: {
    icon: (
      <AlertTriangle
        className="h-3 w-3 text-yellow-500"
        strokeWidth={2}
        aria-label="Warning"
      />
    ),
    bg: "bg-yellow-400",
    text: "Warning",
    iconBg: "bg-yellow-50",
    textColor: "text-yellow-700",
  },
};

export const FormProgress = ({ sections }: FormProgressProps) => {
  return (
    <div className="col-span-12 lg:col-span-4 space-y-6">
      <div className="sticky top-[104px]">
        <Card className="bg-white">
          <CardHeader className="border-b">
            <CardTitle className="text-base font-medium">
              Form Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {sections.map((section, idx) => {
                const config =
                  statusConfig[section.status] || statusConfig.incomplete;
                const isComplete = section.status === "complete";
                return (
                  <div
                    key={section.name}
                    className="flex items-center justify-between py-2 px-3 rounded transition-colors duration-200 hover:bg-slate-50"
                    aria-current={
                      section.status === "complete" ? "step" : undefined
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex items-center justify-center w-6 h-6 rounded-full font-semibold text-xs transition-colors duration-200 ${
                          isComplete
                            ? "bg-green-500 text-white"
                            : "bg-slate-100"
                        }`}
                        aria-label={`Step ${idx + 1}`}
                      >
                        {idx + 1}
                      </div>
                      <span className="text-sm text-slate-700 font-medium">
                        {section.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 min-w-[80px] justify-end">
                      <span
                        className={`text-xs font-medium ${config.textColor} transition-colors duration-200`}
                      >
                        {config.text}
                      </span>
                      <span
                        className="inline-flex items-center justify-center h-5 w-5 rounded-full transition-colors duration-200"
                        aria-hidden="true"
                      >
                        {config.icon}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Legend for required/optional fields and accuracy */}
            <div className="mt-6 flex items-start gap-2 bg-blue-50 border border-blue-100 rounded p-3 text-xs text-blue-800">
              <svg
                className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>
                <strong>Note:</strong> Not all fields are required to complete
                the form. However, providing more details (especially in{" "}
                <em>Asset Details</em> and <em>Category-Specific Fields</em>)
                will improve the accuracy of reports and analytics.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

import React from "react";
import { FormSection } from "@/types/form";

interface FormProgressProps {
  sections: FormSection[];
  expandedSections: string[];
  toggleSection: (e: React.MouseEvent, section: string) => void;
}

export const FormProgress = ({
  sections,
  expandedSections,
  toggleSection,
}: FormProgressProps) => (
  <div className="bg-white rounded-lg border shadow-sm p-6">
    <h3 className="font-medium mb-4">Form Progress</h3>
    <div className="space-y-3">
      {sections.map((section) => (
        <div
          key={section.id}
          className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-md transition-colors"
          onClick={(e) => {
            toggleSection(e, section.id);
            document
              .getElementById(section.id)
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              expandedSections.includes(section.id)
                ? "bg-blue-500"
                : section.isComplete
                  ? "bg-green-500"
                  : "bg-slate-200"
            }`}
          />
          <span
            className={`text-sm capitalize ${
              expandedSections.includes(section.id)
                ? "text-blue-600 font-medium"
                : "text-slate-600"
            }`}
          >
            {section.label}
          </span>
        </div>
      ))}
    </div>
  </div>
);

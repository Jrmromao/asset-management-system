import React from "react";

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({ title, children }) => {
  return (
    <div className="py-6 first:pt-0 last:pb-0">
      <h3 className="text-base font-semibold mb-4 text-slate-900 dark:text-gray-100">
        {title}
      </h3>
      <div className="space-y-6">{children}</div>
    </div>
  );
};

export default FormSection;

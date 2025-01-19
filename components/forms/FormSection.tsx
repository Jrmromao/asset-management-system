import React from "react";

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const FormSection = ({ title, children, className = "" }: FormSectionProps) => (
  <div className={`space-y-4 ${className} p-6`}>
    <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
    <div className="space-y-6">{children}</div>
  </div>
);
export default FormSection;

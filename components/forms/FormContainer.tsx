import React from "react";
import { ModalManager } from "@/components/ModalManager";
import { useFormModals } from "@/hooks/useFormModals";
import { ProgressIndicator } from "@/components/forms/ProgressIndicator";

interface FormContainerProps {
  form: any;
  children: React.ReactNode;
}

export const FormContainer = ({ form, children }: FormContainerProps) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <ModalManager modals={useFormModals(form)} />
      <ProgressIndicator form={form} />
      {children}
    </div>
  );
};

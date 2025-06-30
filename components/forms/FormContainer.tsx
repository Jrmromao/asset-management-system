import React from "react";
import { ModalManager } from "@/components/ModalManager";
import { useFormModals } from "@/hooks/useFormModals";
import { ProgressIndicator } from "@/components/forms/ProgressIndicator";

interface FormContainerProps {
  form: any;
  children: React.ReactNode;
  requiredFieldsCount: number;
  requiredFields: string[];
  hideProgress?: boolean;
}

export const FormContainer = ({
  form,
  children,
  requiredFields,
  requiredFieldsCount,
  hideProgress,
}: FormContainerProps) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <ModalManager modals={useFormModals(form)} />
      {!hideProgress && (
        <ProgressIndicator
          form={form}
          requiredFieldsCount={requiredFieldsCount}
          requiredFields={requiredFields}
        />
      )}
      {children}
    </div>
  );
};

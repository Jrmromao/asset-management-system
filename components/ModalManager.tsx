// components/ModalManager.tsx
import { DialogContainer } from "@/components/dialogs/DialogContainer";
import { ModalConfig } from "@/types/modals";

interface ModalManagerProps {
  modals: ModalConfig[];
}

export const ModalManager = ({ modals }: ModalManagerProps) => {
  return (
    <>
      {modals.map((modal) => (
        <DialogContainer
          key={modal.id}
          description={modal.description}
          open={modal.isOpen}
          onOpenChange={modal.onClose}
          title={modal.title}
          form={<modal.Component onSuccess={modal.onSuccess} />}
        />
      ))}
    </>
  );
};

export type ModalConfig = {
  id: string;
  title: string;
  description: string;
  Component: React.ComponentType<any>;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (id: string) => void;
};

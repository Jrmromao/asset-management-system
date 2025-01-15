import { useCallback, useState } from "react";

export const useConfirmationDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [promise, setPromise] = useState<{
    resolve: (value: boolean) => void;
    reject: (reason?: any) => void;
  } | null>(null);

  const confirm = useCallback(() => {
    setIsOpen(true);
    return new Promise<boolean>((resolve, reject) => {
      setPromise({ resolve, reject });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    promise?.resolve(true);
    setIsOpen(false);
  }, [promise]);

  const handleCancel = useCallback(() => {
    promise?.resolve(false);
    setIsOpen(false);
  }, [promise]);

  return {
    confirm,
    isOpen,
    handleConfirm,
    handleCancel,
    setIsOpen,
  };
};

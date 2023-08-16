import { useCallback, useContext } from "react";
import { ConfirmDialogContext, ConfirmDialogOpenOptions } from "@/components/shared/ConfirmDialogProvider";

export interface UseConfirmDialogOptions extends ConfirmDialogOpenOptions {
  /**
   * The function to execute when the confirm button is clicked.
   * Throwing an error will prevent the dialog from closing.
   * @returns A promise if the dialog should close when the promise resolves.
   */
  onConfirm?: () => Promise<any>;
  onError?: (e: any) => void;
}

export const useConfirmDialog = (confirmDialogOptions?: UseConfirmDialogOptions) => {
  const { open, close, isLoading, isOpen, setLoading } = useContext(ConfirmDialogContext);

  const confirm = useCallback((options?: UseConfirmDialogOptions) => {
    const content = {
      ...confirmDialogOptions?.content,
      ...options?.content,
    };

    const callbacks = {
      ...confirmDialogOptions?.callbacks,
      ...options?.callbacks,
    };

    open({
      content,
      callbacks: {
        ...callbacks,
        onConfirmClick: async () => {
          callbacks?.onConfirmClick?.();
          
          const onConfirm = options?.onConfirm ?? confirmDialogOptions?.onConfirm;
          const onError = options?.onError ?? confirmDialogOptions?.onError;

          setLoading(true);
          try {
            await onConfirm?.();
            close();
          }
          catch (e) {
            onError?.(e);
          }
          setLoading(false);
        },
      },
    });
  }, [confirmDialogOptions, open, setLoading, close]);

  return {
    confirm,
    close,
    isLoading,
    isOpen,
  };
}
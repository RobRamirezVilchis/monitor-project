import { useCallback, useContext } from "react";
import { ConfirmDialogContext, ConfirmDialogOptions } from "@/components/shared/ConfirmDialogProvider";

import { deepMerge } from "@/utils/object.utils";

export interface UseConfirmDialogOptions extends Omit<ConfirmDialogOptions, "onConfirm" | "onCancel"> {
  /**
   * The function to execute when the confirm button is clicked.
   * Throwing an error will prevent the dialog from closing.
   * @returns A promise if the dialog should close when the promise resolves.
   * @throws An error if the dialog should not close.
   */
  onConfirm?: () => void | Promise<void>;
  /**
   * The function to execute on confirm if no error is thrown.
   */
  onSuccess?: () => void;
  /**
   * The function to execute on confirm if an error is thrown.
   */
  onError?: (e: any) => void;
}

export const useConfirmDialog = (confirmDialogOptions?: UseConfirmDialogOptions) => {
  const { open, close, isLoading, isOpen } = useContext(ConfirmDialogContext);

  const confirm = useCallback((options?: UseConfirmDialogOptions) => {
    const openOptions = deepMerge(
      deepMerge({}, confirmDialogOptions, ["title", "content"]), 
      options,
      ["title", "content"]
    );
    open({
      ...openOptions,
      onConfirm: async () => {
        try {
          await openOptions?.onConfirm?.();
          openOptions?.onSuccess?.();
          return true;
        }
        catch (e) {
          openOptions?.onError?.(e);
        }
        return false;
      },
    });
  }, [confirmDialogOptions, open]);

  return {
    confirm,
    close,
    isLoading,
    isOpen,
  };
}
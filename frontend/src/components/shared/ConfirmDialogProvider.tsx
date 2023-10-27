import { ReactNode, createContext, useCallback, useMemo, useState } from "react";
import { 
  Button, 
  type ButtonProps,
  Modal,
  type ModalProps,
  ElementProps,
  Group,
  type GroupProps,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { deepMerge } from "@/utils/object.utils";

export interface ConfirmDialogCallbacks {
  /**
   * The function to execute when the confirm button is clicked.
   * @returns A promise if the dialog should close when the promise resolves.
   */
  onConfirm?: () => boolean | Promise<boolean>;
  /**
   * The function to execute when the cancel button is clicked.
   */
  onCancel?: () => void;
  /**
   * The function to execute when the dialog is closed.
   */
  onClose?: () => void;
}

export interface ConfirmDialogOptions extends ConfirmDialogCallbacks {
  /**
   * The title of the dialog.
   */
  title?: ReactNode;
  /**
   * The content of the dialog.  
   */
  content?: ReactNode;
  /**
   * The labels of the buttons.
   */
  labels?: {
    confirm?: string;
    cancel?: string;
  };
  /**
   * The props of the modal.
   */
  modalProps?: Omit<ModalProps, "children" | "opened" | "title" | "onClose">;
  /**
   * The props of the confirm button.
   */
  confirmProps?: Omit<ButtonProps, "disabled" | "loading"> & ElementProps<"button">;
  /**
   * The props of the cancel button.
   */
  cancelProps?: Omit<ButtonProps, "disabled" | "loading"> & ElementProps<"button">;
  /**
   * The props of the button group.
   */
  groupProps?: GroupProps;
}

// Context --------------------------------------------------------------------
export interface ConfirmDialogContextProps {
  isOpen: boolean;
  open: (options?: ConfirmDialogOptions) => void;
  close: () => void;
  isLoading: boolean;
}

export const ConfirmDialogContext = createContext<ConfirmDialogContextProps>({
  isOpen: false,
  open: () => console.warn("Not ConfirmDialogProvider found"),
  close: () => console.warn("Not ConfirmDialogProvider found"),
  isLoading: false,
});

// Provider -------------------------------------------------------------------
export interface ConfirmDialogProviderProps extends ConfirmDialogOptions {
  children: ReactNode;
}

const defaultDialogContent: ConfirmDialogOptions = {
  title: "Confirm",
  content: "Are you sure you want to perform this action?",
  labels: {
    confirm: "Confirm",
    cancel: "Cancel",
  },
};

export const ConfirmDialogProvider = ({ 
  children, 
  ...props
}: ConfirmDialogProviderProps) => {
  const [isOpen, modal] = useDisclosure(false);
  const [isLoading, setLoading] = useState(false);
  const [mergedProps, setMergedProps] = useState(props);

  const open = useCallback((options?: ConfirmDialogOptions) => {
    setMergedProps(deepMerge(
      deepMerge({}, props, ["title", "content"]), 
      options,
      ["title", "content"],
    ));
    modal.open();
  }, [modal, props]);

  const close = useCallback(() => {
    setLoading(false);
    modal.close();
    mergedProps?.onClose?.();
  }, [modal, setLoading, mergedProps]);

  const contextValue = useMemo<ConfirmDialogContextProps>(() => ({
    isOpen,
    open,
    close,
    isLoading,
  }), [isOpen, open, close, isLoading]);

  return (
    <ConfirmDialogContext.Provider value={contextValue}>
      {children}
      
      <Modal
        {...mergedProps?.modalProps}
        opened={isOpen}
        onClose={close}
        title={mergedProps?.title || defaultDialogContent.title}
      >
        {mergedProps?.content || defaultDialogContent.content}

        <Group 
          className="mt-4" 
          justify="center"
          {...mergedProps?.groupProps}
        >
          <Button
            variant="outline"
            {...mergedProps?.cancelProps}
            disabled={isLoading}
            onClick={e => {
              mergedProps.cancelProps?.onClick?.(e);
              mergedProps?.onCancel?.();
              close();
            }}
          >
            {mergedProps.labels?.cancel || defaultDialogContent.labels?.cancel}
          </Button>
          <Button
            variant="outline"
            {...mergedProps?.confirmProps}
            loading={isLoading}
            onClick={async e => {
              setLoading(true);
              mergedProps.confirmProps?.onClick?.(e);
              try {
                const shouldClose = await mergedProps?.onConfirm?.();
                if (shouldClose) close();
              } catch (e) { }
              setLoading(false);
            }}
          >
            {mergedProps.labels?.confirm || defaultDialogContent.labels?.confirm}
          </Button>
        </Group>
      </Modal>
    </ConfirmDialogContext.Provider>
  );
}

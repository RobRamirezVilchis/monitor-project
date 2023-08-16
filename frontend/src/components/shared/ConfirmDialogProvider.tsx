import { ReactNode, createContext, useCallback, useMemo, useRef } from "react";
import Button, { ButtonProps } from "@mui/material/Button";
import Dialog, { DialogProps } from "@mui/material/Dialog";
import LoadingButton, { LoadingButtonProps } from "@mui/lab/LoadingButton";
import { useImmer } from "use-immer";

export interface ConfirmDialogContent {
  title: ReactNode;
  body: ReactNode;
  confirmLabel: ReactNode;
  cancelLabel: ReactNode;
}

export interface ConfirmDialogCallbacks {
  onConfirmClick: () => void;
  onCancelClick: () => void;
  onClose: () => void;
}

export interface ConfirmDialogOpenOptions {
  content?: Partial<ConfirmDialogContent>;
  callbacks?: Partial<ConfirmDialogCallbacks>;
}

// Context --------------------------------------------------------------------
export interface ConfirmDialogContextProps {
  isOpen: boolean;
  open: (options?: ConfirmDialogOpenOptions) => void;
  close: () => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const ConfirmDialogContext = createContext<ConfirmDialogContextProps>({
  isOpen: false,
  open: () => console.warn("Not ConfirmDialogProvider found"),
  close: () => console.warn("Not ConfirmDialogProvider found"),
  isLoading: false,
  setLoading: () => console.warn("Not ConfirmDialogProvider found"),
});

// Provider -------------------------------------------------------------------
export interface ConfirmDialogProviderProps {
  children: ReactNode;
  content?: Partial<ConfirmDialogContent>;
  outsideClickClose?: boolean;
  dialogProps?: Omit<DialogProps, "open" | "onClose">;
  confirmButtonProps?: Omit<LoadingButtonProps, "loading">;
  cancelButtonProps?: Omit<ButtonProps, "disabled">;
}

const defaultDialogContent: ConfirmDialogContent = {
  title: "Confirm",
  body: "Are you sure you want to perform this action?",
  confirmLabel: "Confirm",
  cancelLabel: "Cancel",
};

export const ConfirmDialogProvider = ({ 
  children, content, outsideClickClose,
  dialogProps, confirmButtonProps, cancelButtonProps,
}: ConfirmDialogProviderProps) => {
  const [state, setState] = useImmer({
    open: false,
    loading: false,
    content: {
      ...defaultDialogContent,
      ...content,
    },
  });
  const callbacksRef = useRef<Partial<ConfirmDialogCallbacks>>();

  const open = useCallback((options?: ConfirmDialogOpenOptions) => {
    callbacksRef.current = options?.callbacks;
    setState(draft => { 
      draft.open = true; 
      draft.content = {
        ...defaultDialogContent,
        ...content,
        ...options?.content,
      };
    });
  }, [setState, content]);

  const close = useCallback(() => {
    setState(draft => { 
      draft.open = false;
      draft.loading = false;
    });
    callbacksRef.current?.onClose?.();
  }, [setState]);

  const setLoading = useCallback((loading: boolean) => {
    setState(draft => { draft.loading = loading; });
  }, [setState]);

  const contextValue = useMemo<ConfirmDialogContextProps>(() => ({
    isOpen: state.open,
    open,
    close,
    isLoading: state.loading,
    setLoading,
  }), [state.open, open, close, state.loading, setLoading]);

  return (
    <ConfirmDialogContext.Provider value={contextValue}>
      {children}
      
      <Dialog
        open={state.open}
        onClose={outsideClickClose && !state.loading ? close : undefined}
        {...dialogProps}
      >
        <div className="p-6">
          <div className="text-lg mb-2 text-center font-bold">
            {state.content.title}
          </div>

          <div className="text-lg p-6 text-center">
            {state.content.body}
          </div>

          <div className="flex justify-center items-center gap-8 mt-4">
            <Button
              color="error"
              variant="outlined"
              {...cancelButtonProps}
              disabled={state.loading}
              onClick={e => {
                close();
                callbacksRef.current?.onCancelClick?.();
                cancelButtonProps?.onClick?.(e);
              }}
            >
              {state.content.cancelLabel}
            </Button>
            <LoadingButton
              variant="outlined"
              {...confirmButtonProps}
              loading={state.loading}
              onClick={e => {
                callbacksRef.current?.onConfirmClick?.();
                confirmButtonProps?.onClick?.(e);
              }}
            >
              {state.content.confirmLabel}
            </LoadingButton>
          </div>
        </div>
      </Dialog>
    </ConfirmDialogContext.Provider>
  );
}
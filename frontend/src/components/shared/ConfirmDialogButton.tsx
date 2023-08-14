import Dialog from "@mui/material/Dialog";
import Button, { LoadingButtonProps as ButtonProps } from "@mui/lab/LoadingButton";
import { FC, ReactNode, useState } from "react";

export interface ActionButtonProps extends ButtonProps {
  label?: ReactNode;
}

export interface ConfirmDialogButtonProps extends ButtonProps {
  dialogProps?: {
    /**
     * The content of the dialog
     */
    content?: ReactNode;
    /**
     * The function to execute when the confirm button is clicked
     * If it returns a Promise<boolean>, the dialog will close when the promise resolves
     * If it returns a Promise<undefined>, the dialog will stay open
     */
    onConfirm?: () => Promise<boolean>;
    /**
     * Props to pass to the confirm button
     */
    confirmProps?: ActionButtonProps;
    /**
     * Props to pass to the cancel button
     */
    cancelProps?: ActionButtonProps;
  };
}

/**
 * Creates a button that opens a dialog to confirm an action
 */
export const ConfirmDialogButton: FC<ConfirmDialogButtonProps> = ({
  children,
  dialogProps,
  ...buttonProps
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { label: confirmLabel, ...confirmProps } =
    dialogProps?.confirmProps ?? {};
  const { label: cancelLabel, ...cancelProps } = dialogProps?.cancelProps ?? {};

  const onConfirm = async () => {
    setLoading(true);
    const close = await dialogProps?.onConfirm?.();
    setOpen(!close);
    setLoading(false);
  };

  return (
    <>
      <Button
        {...buttonProps}
        onClick={(e) => {
          setOpen(true);
          buttonProps?.onClick?.(e);
        }}
      >
        {children}
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
      >
        <div className="p-6">
          <div className="text-lg p-6 text-center">
            {dialogProps?.content ?? (
              <p>¿Está seguro de realizar esta acción?</p>
            )}
          </div>

          <div className="flex justify-center items-center gap-8 mt-4">
            <Button
              variant="outlined"
              {...cancelProps}
              disabled={loading}
              onClick={(e) => {
                setOpen(false);
                cancelProps?.onClick?.(e);
              }}
            >
              {cancelLabel ?? "Cancelar"}
            </Button>
            <Button
              variant="outlined"
              {...confirmProps}
              loading={loading}
              loadingPosition="end"
              endIcon={<span className={loading ? "ml-4" : ""}></span>}
              onClick={(e) => {
                onConfirm();
                confirmProps?.onClick?.(e);
              }}
            >
              {confirmLabel ?? "Confirmar"}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

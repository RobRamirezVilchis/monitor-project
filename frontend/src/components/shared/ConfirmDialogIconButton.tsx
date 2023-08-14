import Dialog from "@mui/material/Dialog";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import { Button } from "./Button";
import { LoadingButtonProps as ButtonProps } from "@mui/lab/LoadingButton";
import { FC, ReactNode, useState, forwardRef } from "react";

export interface ActionButtonProps extends ButtonProps {
  label?: ReactNode;
}

export interface ConfirmDialogIconButtonProps extends IconButtonProps {
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
 * Creates a button that opens a dialog to confirm an action.
 * This is a version of ConfirmDialogButton that uses an IconButton instead of a Button
 * and uses forwardRef since most of the time IconButtons are wrapped in a Tooltip.
 */
export const ConfirmDialogIconButton = forwardRef<any, ConfirmDialogIconButtonProps>(({
  children,
  dialogProps,
  ...buttonProps
}, ref) => {
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
      <IconButton
        {...buttonProps}
        onClick={(e) => {
          setOpen(true);
          buttonProps?.onClick?.(e);
        }}
        ref={ref as any}
      >
        {children}
      </IconButton>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        classes={{
          paper: "rounded-2xl",
        }}
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
});
ConfirmDialogIconButton.displayName = "ConfirmDialogIconButton";
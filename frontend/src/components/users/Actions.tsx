import { FC } from "react";
import Tooltip from "@mui/material/Tooltip";

import { ConfirmDialogIconButton } from "@/components/shared/ConfirmDialogIconButton";
import { useAuth } from "@/hooks/auth";
import { useDeleteWhitelistItemMutation } from "@/api/mutations/users";
import { useSnackbar } from "@/hooks/shared";
import { WhitelistItem } from "@/api/users.types";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

export interface ActionsProps {
  whitelistItem: WhitelistItem;
}

export const Actions: FC<ActionsProps> = ({ whitelistItem }) => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const deleteWhitelistItemMutation = useDeleteWhitelistItemMutation({
    onSuccess: () => enqueueSnackbar("Usuario eliminado correctamente.", { variant: "success" }),
    onError: () => enqueueSnackbar("Ocurrió un error al eliminar el usuario. Por favor intenta de nuevo más tarde.", { variant: "error" }),
  });

  return (
    <div className="w-full flex justify-center items-center">
      <Tooltip title="Eliminar usuario" disableInteractive>
        <span>
          <ConfirmDialogIconButton
            aria-label="Eliminar usuario"
            color="error"
            dialogProps={{
              confirmProps: {
                color: "error",
                label: "Eliminar",
              },
              content: "¿Está seguro de eliminar este usuario?",
              onConfirm: async () => {
                try {
                  await deleteWhitelistItemMutation.mutateAsync(whitelistItem.id);
                  return true;
                }
                catch (error) {
                  return false;
                }
              },
            }}
            disabled={
              deleteWhitelistItemMutation.isLoading 
              || (!!user && !!whitelistItem.user && user.id === whitelistItem.user.id)
            }
          >
            <DeleteForeverIcon />
          </ConfirmDialogIconButton>
        </span>
      </Tooltip>
    </div>
  );
}
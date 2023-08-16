import { FC } from "react";

import { GridActionsCellTooltipItem } from "@/components/shared/GridActionsCellTooltipItem";
import { useAuth } from "@/hooks/auth";
import { useConfirmDialog } from "@/hooks/shared/useConfirmDialog";
import { useDeleteWhitelistItemMutation } from "@/api/mutations/users";
import { useSnackbar } from "@/hooks/shared";
import { WhitelistItem } from "@/api/users.types";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

export interface ActionsProps {
  whitelistItem: WhitelistItem;
}

export const DeleteUserAction: FC<ActionsProps> = ({ whitelistItem }) => {
  const { user } = useAuth({
    skipAll: true,
    triggerAuthentication: false,
  });
  const { enqueueSnackbar } = useSnackbar();
  const deleteWhitelistItemMutation = useDeleteWhitelistItemMutation({
    onSuccess: () => enqueueSnackbar("Usuario eliminado correctamente.", { variant: "success" }),
    onError: () => enqueueSnackbar("Ocurrió un error al eliminar el usuario. Por favor intenta de nuevo más tarde.", { variant: "error" }),
  });

  const { confirm } = useConfirmDialog({
    content: {
      title: "Eliminar usuario",
      body: "¿Está seguro de eliminar este usuario?",
      confirmLabel: "Eliminar",
      cancelLabel: "Cancelar",
    },
    onConfirm: () => deleteWhitelistItemMutation.mutateAsync(whitelistItem.id),
  });

  return (
    <GridActionsCellTooltipItem
      tooltipProps={{
        title: "Eliminar usuario",
        disableInteractive: true,
      }}
      label="Eliminar usuario"
      icon={<DeleteForeverIcon />}
      color="error"
      disabled={
        deleteWhitelistItemMutation.isLoading 
        || (!!user && !!whitelistItem.user && user.id === whitelistItem.user.id)
      }
      onClick={() => confirm()}
    />
  );
}
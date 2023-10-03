import { FC } from "react";

import { GridActionsCellTooltipItem } from "@/components/shared/GridActionsCellTooltipItem";
import { showSuccessNotification, showErrorNotification } from "@/components/ui/notifications";
import { useAuth } from "@/hooks/auth";
import { useConfirmDialog } from "@/hooks/shared/useConfirmDialog";
import { useDeleteWhitelistItemMutation } from "@/api/mutations/users";
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
  const deleteWhitelistItemMutation = useDeleteWhitelistItemMutation({
    onSuccess: () => showSuccessNotification({
      message: "Usuario eliminado correctamente.",
    }),
    onError: () => showErrorNotification({
      message: "Ocurrió un error al eliminar el usuario. Por favor intenta de nuevo más tarde.",
    }),
  });

  const { confirm } = useConfirmDialog({
    title: "Eliminar usuario",
    content: "¿Está seguro de eliminar este usuario?",
    labels: {
      confirm: "Eliminar",
      cancel: "Cancelar",
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
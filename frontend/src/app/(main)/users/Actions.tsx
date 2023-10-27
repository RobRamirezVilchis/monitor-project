import { FC } from "react";
import { ActionIcon, Tooltip, useMantineTheme } from "@mantine/core";

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
  const theme = useMantineTheme();

  const { confirm } = useConfirmDialog({
    title: "Eliminar usuario",
    content: "¿Está seguro de eliminar este usuario?",
    labels: {
      confirm: "Eliminar",
      cancel: "Cancelar",
    },
    confirmProps: {
      color: "red",
    },
    cancelProps: {
      color: theme.primaryColor,
    },
    onConfirm: () => deleteWhitelistItemMutation.mutateAsync(whitelistItem.id),
  });

  return (
    <Tooltip
      label="Eliminar usuario"
    >
      <ActionIcon
        variant="subtle"
        color="red"
        radius="xl"
        onClick={() => confirm()}
        disabled={
          deleteWhitelistItemMutation.isLoading 
          || (!!user && !!whitelistItem.user && user.id === whitelistItem.user.id)
        }
      >
        <DeleteForeverIcon className="w-5 h-5" />
      </ActionIcon>
    </Tooltip>
  )
}
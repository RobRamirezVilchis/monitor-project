import { FC, useMemo } from "react";
import { ActionIcon, Modal, Tooltip, useMantineTheme } from "@mantine/core";

import { showSuccessNotification, showErrorNotification } from "@/ui/notifications";
import { useAuth } from "@/hooks/auth";
import { useConfirmDialog } from "@/hooks/shared/useConfirmDialog";
import { useCreateUserMutation, useDeleteUserMutation, useUpdateUserMutation } from "@/api/mutations/users";
import { User } from "@/api/services/auth/types";
import { UserForm } from "./UserForm";

import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { IconPencil, IconMail } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";

export interface ActionsProps {
  user: User;
}

export const UpdateUserAction: FC<ActionsProps> = ({ user }) => {
  const { user: currentUser } = useAuth({
    triggerAuthentication: false,
    skipAll: true,
  });
  const [isOpen, { open, close }] = useDisclosure();
  const updateUserMutation = useUpdateUserMutation({
    onSuccess: () => {
      showSuccessNotification({
        message: "Usuario actualizado correctamente.",
      });
      close();
    },
    onError: () => showErrorNotification({
      message: "Ocurrió un error al actualizar el usuario. Por favor intenta de nuevo más tarde.",
    }),
  });
  const theme = useMantineTheme();

  return (<>
    <Tooltip
      label="Editar"
    >
      <ActionIcon
        color={theme.primaryColor}
        radius="xl"
        onClick={open}
        disabled={
          updateUserMutation.isLoading 
          || (!!user && !!currentUser && user.id === currentUser.id)
        }
      >
        <IconPencil className="w-5 h-5" />
      </ActionIcon>
    </Tooltip>

    <Modal
      opened={isOpen}
      onClose={close}
      size="md"
      centered
      title={<p className="text-xl font-semibold">Editar</p>}
    >
      <div className="p-4">
        <UserForm 
          defaultValues={user}
          onSubmit={values => {
            updateUserMutation.mutate({
              id: user.id!,
              data: values,
              // optimistic: true,
            });
          }}
          onCancel={close}
          loading={updateUserMutation.isLoading} 
          disabled={{
            email: true,
          }}
          submitLabel="Guardar"
          cancelLabel="Cancelar"
        />
      </div>
    </Modal>
  </>);
}

export const DeleteUserAction: FC<ActionsProps> = ({ user }) => {
  const { user: currentUser } = useAuth({
    triggerAuthentication: false,
    skipAll: true,
  });
  const deleteUserMutation = useDeleteUserMutation({
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
    onConfirm: () => deleteUserMutation.mutateAsync(user.id!),
  });

  return (
    <Tooltip
      label="Eliminar"
    >
      <ActionIcon
        color="red"
        radius="xl"
        onClick={() => confirm()}
        disabled={
          deleteUserMutation.isLoading 
          || (!!user && !!currentUser && user.id === currentUser.id)
        }
      >
        <DeleteForeverIcon className="w-5 h-5" />
      </ActionIcon>
    </Tooltip>
  );
}

export const SendPasswordChangeAction: FC<ActionsProps> = ({ user }) => {
  const { user: currentUser } = useAuth({
    triggerAuthentication: false,
    skipAll: true,
  });
  const createUserMutation = useCreateUserMutation({
    onSuccess: () => {
      showSuccessNotification({
        message: "Solicitud de cambio de contraseña enviada correctamente.",
      });
      close();
    },
    onError: () => showErrorNotification({
      message: "Ocurrió un error al enviar la solicitud de cambio de contraseña. Por favor intenta de nuevo más tarde.",
    }),
  });
  const theme = useMantineTheme();

  return (
    <Tooltip
      label="Solicitar activación de cuenta"
    >
      <ActionIcon
        color={theme.primaryColor}
        radius="xl"
        onClick={() => {
          createUserMutation.mutate({
            email: user.email,
            username: user.email,
            send_mail: true,
          });
        }}
        disabled={
          createUserMutation.isLoading 
          || (!!user && !!currentUser && user.id === currentUser.id)
        }
      >
        <IconMail className="w-5 h-5" />
      </ActionIcon>
    </Tooltip>
  );
}
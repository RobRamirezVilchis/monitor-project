import { FC } from "react";
import { Select } from "@/components/ui/core";

import { showSuccessNotification, showErrorNotification } from "@/components/ui/notifications";
import { useAuth } from "@/hooks/auth";
import { userRoles } from "@/api/auth.types";
import { useUpdateWhitelistItemMutation } from "@/api/mutations/users";
import { WhitelistItem } from "@/api/users.types";
import { getUserRoleLocalized } from "@/api/users";

export interface RoleSelectorProps {
  whitelistItem: WhitelistItem;
  value: string;
}

export const RoleSelector: FC<RoleSelectorProps> = ({ whitelistItem, value }) => {
  const { user } = useAuth({
    skipAll: true,
    triggerAuthentication: false,
  });
  const updateWhitelistItemMutation = useUpdateWhitelistItemMutation({
    onSuccess: () => showSuccessNotification({
      message: "Rol actualizado correctamente.",
    }),
    onError: () => showErrorNotification({
      message: "Ocurrió un error al actualizar el rol. Por favor intenta de nuevo más tarde.",
    }),
  });

  const onSelectChange = (value: string | null) => {
    if (!value) return;

    const group = value as WhitelistItem["group"];
    updateWhitelistItemMutation.mutate({
      id: whitelistItem.id,
      data: {
        group,
      },
      optimistic: true,
    });
  };

  return (
    <Select
      value={value}
      variant="unstyled"
      classNames={{
        input: "pl-2",
      }}
      onChange={onSelectChange}
      disabled={
        updateWhitelistItemMutation.isLoading
        || (!!user && !!whitelistItem.user && user.id === whitelistItem.user.id)
      }
      data={userRoles.map(role => ({ value: role, label: getUserRoleLocalized(role) }))}
    />
  );
};
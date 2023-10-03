import { FC } from "react";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import { showSuccessNotification, showErrorNotification } from "@/components/ui/notifications";
import { useAuth } from "@/hooks/auth";
import { userRoles } from "@/api/auth.types";
import { useUpdateWhitelistItemMutation } from "@/api/mutations/users";
import { WhitelistItem } from "@/api/users.types";
import { getUserRoleLocalized } from "@/api/users";
import { selectMenuSx } from "@/components/shared/mui.old/hook-form/styled";

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

  const onSelectChange = (e: SelectChangeEvent<string>) => {
    const group = e.target.value as WhitelistItem["group"];
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
      fullWidth
      variant="standard"
      sx={{
        "& .MuiSelect-select, .MuiSelect-nativeInput": {
          padding: 0,
        },
        "& .MuiSelect-select.MuiSelect-standard.MuiInputBase-input.MuiInput-input:focus": {
          backgroundColor: "transparent !important",
        }
      }}
      disableUnderline
      onChange={onSelectChange}
      disabled={
        updateWhitelistItemMutation.isLoading
        || (!!user && !!whitelistItem.user && user.id === whitelistItem.user.id)
      }
      MenuProps={{
        sx: {
          ...selectMenuSx,
        }
      }}
    >
      {userRoles.map((role) => (
        <MenuItem key={role} value={role}>{getUserRoleLocalized(role)}</MenuItem>
      ))}
    </Select>
  );
};
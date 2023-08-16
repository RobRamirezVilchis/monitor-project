import { FC } from "react";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import { useAuth } from "@/hooks/auth";
import { useSnackbar } from "@/hooks/shared";
import { useUpdateWhitelistItemMutation } from "@/api/mutations/users";
import { WhitelistItem } from "@/api/users.types";
import { getUserRoleLocalized } from "@/api/users";
import { selectMenuSx } from "@/components/shared/hook-form/styled";

export interface RoleSelectorProps {
  whitelistItem: WhitelistItem;
  value: string;
}

export const RoleSelector: FC<RoleSelectorProps> = ({ whitelistItem, value }) => {
  const { user } = useAuth({
    skipAll: true,
    triggerAuthentication: false,
  });
  const { enqueueSnackbar } = useSnackbar();
  const updateWhitelistItemMutation = useUpdateWhitelistItemMutation({
    onSuccess: () => enqueueSnackbar("Rol actualizado correctamente.", { variant: "success" }),
    onError: () => enqueueSnackbar("Ocurrió un error al actualizar el rol. Por favor intenta de nuevo más tarde.", { variant: "error" }),
  });

  const onSelectChange = (e: SelectChangeEvent<string>) => {
    const group = e.target.value as WhitelistItem["group"];
    updateWhitelistItemMutation.mutate({
      id: whitelistItem.id,
      data: {
        group,
      },
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
      <MenuItem value="Admin">{getUserRoleLocalized("Admin")}</MenuItem>
    </Select>
  );
};
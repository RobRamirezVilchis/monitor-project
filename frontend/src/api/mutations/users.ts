import { createMutation } from "../helpers/createMutation";
import { addToWhitelist, updateWhitelistItem, deleteWhitelistItem } from "../users";
import { useWhitelistQuery } from "../queries/users";
import { CreateWhitelistItemData } from "../users.types";

export const useAddToWhitelistMutation = createMutation({
  mutationKey: ["users-whitelist-create"],
  mutationFn: (data: CreateWhitelistItemData) => addToWhitelist(data),
  onSuccess: (data, vars, ctx) => {
    useWhitelistQuery.invalidatePrimaryKey({
      refetchType: "active",
    });
  },
});

interface UpdateWhitelistItemMutationsVariables {
  id: Parameters<typeof updateWhitelistItem>[0];
  data: Parameters<typeof updateWhitelistItem>[1];
}

export const useUpdateWhitelistItemMutation = createMutation({
  mutationKey: ["users-whitelist-update"],
  mutationFn: ({ id, data }: UpdateWhitelistItemMutationsVariables) => updateWhitelistItem(id, data),
  onSuccess: (data, vars, ctx) => {
    useWhitelistQuery.invalidatePrimaryKey({
      refetchType: "active"
    });
  },
});

export const useDeleteWhitelistItemMutation = createMutation({
  mutationKey: ["users-whitelist-delete"],
  mutationFn: (id: Parameters<typeof deleteWhitelistItem>[0]) => deleteWhitelistItem(id),
  onSuccess: (data, vars, ctx) => {
    useWhitelistQuery.invalidatePrimaryKey({
      refetchType: "active"
    });
  },
});

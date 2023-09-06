import { produce } from "immer";
import { QueryKey } from "@tanstack/react-query";

import { createMutation } from "../helpers/createMutation";
import { addToWhitelist, updateWhitelistItem, deleteWhitelistItem } from "../users";
import { useWhitelistQuery } from "../queries/users";
import { CreateWhitelistItemData, WhitelistItem } from "../users.types";
import { Paginated } from "../types";

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
  mutationFn: ({ id, data }: UpdateWhitelistItemMutationsVariables & { optimistic?: boolean }) => 
    updateWhitelistItem(id, data),
  // Optimistic update:
  // https://tanstack.com/query/latest/docs/react/guides/optimistic-updates
  onMutate: async (vars) => {
    if (!vars.optimistic) return { };

    const client = useWhitelistQuery.queryClient;
    if (!client) throw new Error("No query client found");

    const cache = client?.getQueryCache();
    const queries = cache?.findAll({
      queryKey: [useWhitelistQuery.queryPrimaryKey],
      type: "active",
    });

    // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
    await client.cancelQueries({ queryKey: [useWhitelistQuery.queryPrimaryKey] });
    // Snapshot the previous value
    const previousData = queries.map((query) => ({ 
        queryKey: query.queryKey, data: query.state.data 
    })) as { queryKey: QueryKey, data: Paginated<WhitelistItem> }[];
    // Optimistically update to the new value
    queries.forEach(query => {
      client.setQueryData<Paginated<WhitelistItem>>(query.queryKey, produce((draft) => {
          if (!draft) return;
          const index = draft.data.findIndex((item) => item.id === vars.id);
          draft.data[index] = { ...draft.data[index], ...vars.data };
        })
      )
    });
    // Return a context object with the snapshotted value
    return { previousData };
  },
  onError: (error, vars, ctx) => {
    if (!vars.optimistic) return;
    // If the mutation fails, use the context returned from onMutate to roll back
    const client = useWhitelistQuery.queryClient;
    ctx?.previousData?.forEach(item => {
      client?.setQueryData(item.queryKey, item.data);
    })
  },
  onSettled: (data, error, vars, ctx) => {
    if (!vars.optimistic) return;
    // Always refetch after error or success:
    useWhitelistQuery.invalidatePrimaryKey({
      refetchType: "none", // "all",
    });
  },
  onSuccess: (data, vars, ctx) => {
    if (vars.optimistic) return;
    // On success, refetch active queries when not making optimistic updates
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

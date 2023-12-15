import { produce } from "immer";
import { QueryKey } from "@tanstack/react-query";

import { createMutation } from "@/api/helpers/createMutation";
import { addToWhitelist, updateWhitelistItem, deleteWhitelistItem, createUser, updateUser, deleteUser } from "@/api/services/users";
import { useUsersQuery, useWhitelistQuery } from "@/api/queries/users";
import { CreateWhitelistItemData, WhitelistItem } from "@/api/services/users/types";
import { Id, Paginated } from "@/api/types";
import { User } from "@/api/services/auth/types";

export const useCreateUserMutation = createMutation({
  mutationKey: ["users-create"],
  mutationFn: (data: Parameters<typeof createUser>[0]) => createUser(data),
  onSuccess: (data, vars, ctx) => {
    useUsersQuery.invalidatePrimaryKey({
      refetchType: "active",
    });
  },
});

interface UpdateUserMutationsVariables {
  id: Parameters<typeof updateUser>[0];
  data: Parameters<typeof updateUser>[1];
}

export const useUpdateUserMutation = createMutation({
  mutationKey: ["users-update"],
  mutationFn: ({ id, data }: UpdateUserMutationsVariables & { optimistic?: boolean }) => updateUser(id, data),
  onMutate: async (vars) => {
    if (!vars.optimistic) return { };

    const client = useUsersQuery.queryClient;
    if (!client) throw new Error("No query client found");

    const cache = client?.getQueryCache();
    const queries = cache?.findAll({
      queryKey: [useUsersQuery.queryPrimaryKey],
      type: "active",
    });

    // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
    await client.cancelQueries({ queryKey: [useUsersQuery.queryPrimaryKey] });
    // Snapshot the previous value
    const previousData = queries.map((query) => ({ 
      queryKey: query.queryKey, data: query.state.data 
    })) as { queryKey: QueryKey, data: Paginated<User> }[];
    // Optimistically update to the new value
    queries.forEach(query => {
      client.setQueryData<Paginated<User>>(query.queryKey, produce((draft) => {
          if (!draft) return;
          const index = draft.data.findIndex((item) => item.id === vars.id);
          // TODO: Remove optimistic update for roles or add valid update data
          // draft.data[index] = { ...draft.data[index], ...vars.data };
        })
      )
    });
    // Return a context object with the snapshotted value
    return { previousData };
  },
  onError: (error, vars, ctx) => {
    if (!vars.optimistic) return;
    // If the mutation fails, use the context returned from onMutate to roll back
    const client = useUsersQuery.queryClient;
    ctx?.previousData?.forEach(item => {
      client?.setQueryData(item.queryKey, item.data);
    })
  },
  onSettled: (data, error, vars, ctx) => {
    if (!vars.optimistic) return;
    // Always refetch after error or success:
    useUsersQuery.invalidatePrimaryKey({
      refetchType: "none", // "all",
    });
  },
  onSuccess: (data, vars, ctx) => {
    if (vars.optimistic) return;
    // On success, refetch active queries when not making optimistic updates
    useUsersQuery.invalidatePrimaryKey({
      refetchType: "active"
    });
  },
});

export const useDeleteUserMutation = createMutation({
  mutationKey: ["users-delete"],
  mutationFn: (id: Id) => deleteUser(id),
  onSuccess: (data, vars, ctx) => {
    useUsersQuery.invalidatePrimaryKey({
      refetchType: "active",
    });
  },
});

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

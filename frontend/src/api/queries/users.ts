import { createQuery } from "../helpers/createQuery";
import { getUsersAccess, getWhitelist } from "../users";
import { UserAccessParams, WhitelistParams } from "../users.types";
import defaultQueryClient from "../clients/defaultQueryClient";

// Whitelist API ------------------------------------------------------

export const useWhitelistQuery = createQuery({
  queryPrimaryKey: "users-whitelist",
  queryKeyVariables: (vars: WhitelistParams) => 
    vars.pagination || vars.filters 
    ? [vars.pagination, vars.filters] 
    : [],
  queryFn: (ctx, vars) => getWhitelist(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 10, // 10 minutes
  staleTime: 1000 * 60 * 5,  // 5 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

// UsersAccess API ----------------------------------------------------

export const useUsersAccessQuery = createQuery({
  queryPrimaryKey: "users-access",
  queryKeyVariables: (vars: UserAccessParams) =>
    vars.pagination || vars.filters 
    ? [vars.pagination, vars.filters] 
    : [],
  queryFn: (ctx, vars) => getUsersAccess(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

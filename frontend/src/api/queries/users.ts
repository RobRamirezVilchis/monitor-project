import { createQuery } from "../helpers/createQuery";
import { getUserRoles, getUsers, getUsersAccess, getWhitelist } from "../services/users";
import { UserAccessFilters, UsersFilters, WhitelistFilters } from "../services/users/types";
import defaultQueryClient from "../clients/defaultQueryClient";

// Users API ----------------------------------------------------------

export const useUsersQuery = createQuery({
  queryPrimaryKey: "users",
  queryKeyVariables: (vars: UsersFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => getUsers(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

// Roles API ----------------------------------------------------------

export const useRolesQuery = createQuery({
  queryPrimaryKey: "users-roles",
  queryFn: (ctx) => getUserRoles({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  queryClient: defaultQueryClient,
});

// Whitelist API ------------------------------------------------------

export const useWhitelistQuery = createQuery({
  queryPrimaryKey: "users-whitelist",
  queryKeyVariables: (vars: WhitelistFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => getWhitelist(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 10, // 10 minutes
  staleTime: 1000 * 60 * 5,  // 5 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

// UsersAccess API ----------------------------------------------------

export const useUsersAccessQuery = createQuery({
  queryPrimaryKey: "users-access",
  queryKeyVariables: (vars: UserAccessFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => getUsersAccess(vars, { signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

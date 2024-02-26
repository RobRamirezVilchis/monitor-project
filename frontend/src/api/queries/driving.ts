import { createQuery } from "../helpers/createQuery";
import { getUserRoles, getUsers, getUsersAccess, getWhitelist } from "../services/users";
import { getUnits } from "../services/monitor";
import { UserAccessFilters, UsersFilters, WhitelistFilters } from "../services/users/types";
import defaultQueryClient from "../clients/defaultQueryClient";

// Safe Driving API ----------------------------------------------------------

export const useUnitsQuery = createQuery({
  queryPrimaryKey: "units",
  //queryKeyVariables: (vars: UsersFilters) => vars ? [vars] : [],
  queryFn: (ctx, vars) => getUnits({ signal: ctx.signal }),
  cacheTime: 1000 * 60 * 5,  // 5 minutes
  staleTime: 1000 * 60 * 3,  // 3 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});
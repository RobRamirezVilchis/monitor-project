import { createQuery } from "../helpers/createQuery";
import { getMyUser } from "../services/auth";
import defaultQueryClient from "../clients/defaultQueryClient";

export const useMyUserQuery = createQuery({
  queryPrimaryKey: "me",
  queryFn: (ctx) => getMyUser({ signal: ctx.signal, rejectRequest: false, onError: false }),
  cacheTime: 1000 * 60 * 10, // 10 minutes
  staleTime: 1000 * 60 * 5,  // 5 minutes
  keepPreviousData: true,
  queryClient: defaultQueryClient,
});

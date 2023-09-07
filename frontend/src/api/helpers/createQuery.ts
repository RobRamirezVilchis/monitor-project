import { useCallback } from "react";
import {
  FetchQueryOptions,
  InvalidateQueryFilters,
  QueryClient,
  QueryFilters,
  QueryFunctionContext,
  QueryKey,
  RefetchOptions,
  RefetchQueryFilters,
  SetDataOptions,
  Updater,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";

import { UnionFlatten } from "@/utils/types";

export type CreateQueryOptions<
  TVariables = unknown, 
  TQueryFnData = unknown, 
  TError = unknown, 
  TData = TQueryFnData, 
  TQueryKeyVariables extends unknown[] = unknown[]
> = 
Omit<
  UseQueryOptions<
    TQueryFnData,
    TError,
    TData,
    UnionFlatten<string, TQueryKeyVariables>
  >,
  "queryKey" | "queryFn"
> & {
  queryPrimaryKey: string;
  queryKeyVariables?: (TVariables extends undefined ? (() => TQueryKeyVariables) : ((variables: TVariables) => TQueryKeyVariables));
  queryFn: (
    context: QueryFunctionContext<UnionFlatten<string, TQueryKeyVariables>, any>, 
    variables: TVariables extends undefined ? void : TVariables
  ) => TQueryFnData | Promise<TQueryFnData>;
  /**
   * The QueryClient used by the result invalidate and get/set global functions only.
   * When the hook is consumed, invalidate and get/set functions will use the client
   * returned by the useQueryClient hook based on the context given.
   */
  queryClient?: QueryClient;
};

export type QueryOptions<
  TVariables = unknown, 
  TQueryFnData = unknown, 
  TError = unknown, 
  TData = TQueryFnData, 
  TQueryKey extends QueryKey = QueryKey
> = 
Omit<
  UseQueryOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryKey
  >,
  "queryHash" | "queryKeyHashFn" | "queryKey" | "queryFn" | "context"
> & (
  TVariables extends undefined 
  ? {  } 
  : { variables: TVariables; }
);

export type QueryInvalidateOptions = Omit<InvalidateQueryFilters, "queryKey">;

export type UseCreatedQueryResult<TVariables, TQueryFnData, TData, TError> = UseQueryResult<TData, TError> & {
  queryPrimaryKey: string,
  queryKey: QueryKey;
  invalidate: (options?: QueryInvalidateOptions) => Promise<void>;
  setData: (updater: Updater<TQueryFnData | undefined, TQueryFnData | undefined>, options?: SetDataOptions) => TQueryFnData | undefined;
  getData: (filters?: QueryFilters) => TQueryFnData | undefined;
  queryClient: QueryClient,
} & (
  TVariables extends undefined 
  ? {  } 
  : { variables: TVariables; }
);

export type UseCreatedQuery<
  TVariables = unknown, 
  TQueryFnData = unknown, 
  TError = unknown, 
  TData = TQueryFnData, 
  TQueryKey extends QueryKey = QueryKey
> = TVariables extends undefined
  ? <TRData = TData>(options?: QueryOptions<TVariables, TQueryFnData,  TError, TRData, TQueryKey>) => UseCreatedQueryResult<TVariables, TQueryFnData, TRData, TError> 
  : <TRData = TData>(options: QueryOptions<TVariables, TQueryFnData,  TError, TRData, TQueryKey>) => UseCreatedQueryResult<TVariables, TQueryFnData, TRData, TError>

export function createQuery<
  TVariables = undefined, 
  TQueryFnData = unknown, 
  TError = unknown, 
  TData = TQueryFnData, 
  TQueryKeyVariables extends unknown[] = unknown[]
>(
  useQueryOptions: CreateQueryOptions<TVariables, TQueryFnData, TError, TData, TQueryKeyVariables>,
) {
  const { queryPrimaryKey, queryKeyVariables: queryKeyVariables, queryFn, ...otherOptions } = useQueryOptions;

  const queryKeyFn: (
    TVariables extends undefined 
    ? (() => UnionFlatten<string, TQueryKeyVariables>) 
    : ((variables: TVariables) => UnionFlatten<string, TQueryKeyVariables>)
  ) = 
  ((variables: any) => {
    const qVariables = queryKeyVariables?.(variables);
    return qVariables ? [queryPrimaryKey, ...qVariables] : [queryPrimaryKey];
  }) as any;

  const invalidatePrimaryKey = 
  (options?: QueryInvalidateOptions) => {
    if (!useQueryOptions.queryClient) {
      throw new Error("queryClient is not defined.");
    }

    const queryKey = [queryPrimaryKey];

    return useQueryOptions.queryClient.invalidateQueries({
      queryKey,
      ...options,
    });
  };

  const invalidate: (
    TVariables extends undefined 
    ? ((options?: QueryInvalidateOptions) => Promise<void>) 
    : ((options: QueryInvalidateOptions & { variables: TVariables; }) => Promise<void>)
  ) = 
  ((opts: any) => {
    if (!useQueryOptions.queryClient) {
      throw new Error("queryClient is not defined.");
    }

    const { variables, ...options } = opts || {};
    const queryKey = queryKeyFn(variables);

    return useQueryOptions.queryClient.invalidateQueries({
      queryKey,
      ...options,
    });
  }) as any;

  const setData: (
    TVariables extends undefined 
    ? ((updater:  Updater<TQueryFnData | undefined, TQueryFnData | undefined>, options?: SetDataOptions) => TQueryFnData | undefined) 
    : ((updater:  Updater<TQueryFnData | undefined, TQueryFnData | undefined>, options: SetDataOptions & { variables: TVariables; }) => TQueryFnData | undefined)
  ) = 
  ((updater: any, opts?: any) => {
    if (!useQueryOptions.queryClient) {
      throw new Error("queryClient is not defined.");
    }

    const { variables, ...options } = opts || {};
    const queryKey = queryKeyFn(variables);

    return useQueryOptions.queryClient.setQueryData<TQueryFnData>(queryKey, updater, options);
  }) as any;

  const getData: (
    TVariables extends undefined 
    ? ((filters?: QueryFilters) => TQueryFnData | undefined) 
    : ((filters: QueryFilters & { variables: TVariables; }) => TQueryFnData | undefined)
  ) = 
  ((opts: any) => {
    if (!useQueryOptions.queryClient) {
      throw new Error("queryClient is not defined.");
    }

    const { variables, ...filters } = opts || {};
    const queryKey = queryKeyFn(variables);

    return useQueryOptions.queryClient.getQueryData<TQueryFnData>(queryKey, filters)
  }) as any;

  const prefetch: (
    TVariables extends undefined
    ? ((options?: FetchQueryOptions<TQueryFnData, TError, TData, UnionFlatten<string, TQueryKeyVariables>>) => Promise<TQueryFnData>)
    : ((options: FetchQueryOptions<TQueryFnData, TError, TData, UnionFlatten<string, TQueryKeyVariables>> & { variables: TVariables }) => Promise<TQueryFnData>)
  ) =
  ((opts?: any) => {
    if (!useQueryOptions.queryClient) {
      throw new Error("queryClient is not defined.");
    }

    const { variables, ...options } = opts || {};
    const queryKey = queryKeyFn(variables);
    return useQueryOptions.queryClient.prefetchQuery<TQueryFnData, TError, TData, UnionFlatten<string, TQueryKeyVariables>>(
      queryKey, ctx => queryFn(ctx, variables), options
    );
  }) as any;

  const refetch: (
    TVariables extends undefined
    ? ((filters?: Omit<RefetchQueryFilters<TQueryFnData>, "queryKey">, options?: RefetchOptions) => Promise<TQueryFnData>)
    : ((filters: Omit<RefetchQueryFilters<TQueryFnData>, "queryKey"> & { variables: TVariables }, options?: RefetchOptions) => Promise<TQueryFnData>)
  ) =
  ((_filters?: any, options?: any) => {
    if (!useQueryOptions.queryClient) {
      throw new Error("queryClient is not defined.");
    }

    const { variables, ...filters } = _filters || {};
    const queryKey = queryKeyFn(variables);
    return useQueryOptions.queryClient.refetchQueries<TQueryFnData>({
      queryKey,
      ...filters
    }, options);
  }) as any;


  const useCreatedQuery: UseCreatedQuery<TVariables, TQueryFnData, TError, TData, UnionFlatten<string, TQueryKeyVariables>> = 
  ((options: any) => {
    const queryClient = useQueryClient({ context: useQueryOptions?.context });
    const queryKey = queryKeyFn(options?.variables)
    
    const invalidate = useCallback(
      (options?: QueryInvalidateOptions) => 
        queryClient.invalidateQueries({
          queryKey,
          ...options,
        }),
      [queryClient, queryKey]
    );

    const setData = useCallback(
      (updater:  Updater<TQueryFnData | undefined, TQueryFnData | undefined>, options?: SetDataOptions) =>
        queryClient.setQueryData(queryKey, updater, options),
      [queryClient, queryKey]
    );

    const getData = useCallback(
      (filters?: QueryFilters) => queryClient.getQueryData<TQueryFnData>(queryKey, filters),
      [queryClient, queryKey]
    );

    const useQueryResult = useQuery<TQueryFnData, TError, TData, UnionFlatten<string, TQueryKeyVariables>>({
      queryKey,
      queryFn: ctx => queryFn(ctx, options?.variables),
      ...otherOptions,
      ...options,
    });

    return Object.assign(useQueryResult, {
      queryPrimaryKey,
      queryKey,
      invalidate,
      setData,
      getData,
      queryClient,
      variables: options?.variables,
    });
  }) as any;

  return Object.assign(useCreatedQuery, {
    queryPrimaryKey,
    queryKey: queryKeyFn,
    queryFn: useQueryOptions.queryFn,
    queryHash: useQueryOptions.queryHash,
    queryKeyHashFn: useQueryOptions.queryKeyHashFn,
    context: useQueryOptions.context,
    queryClient: useQueryOptions.queryClient,
    invalidatePrimaryKey,
    invalidate,
    setData,
    getData,
    prefetch,
    refetch,
  });
}

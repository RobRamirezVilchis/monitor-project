import { useCallback } from "react";
import {
  InvalidateQueryFilters,
  QueryClient,
  QueryFilters,
  QueryFunctionContext,
  QueryKey,
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

export type CreateQueryResult<TVariables, TQueryFnData, TData, TError> = UseQueryResult<TData, TError> & {
  queryPrimaryKey: string,
  queryKey: QueryKey;
  invalidate: (options?: QueryInvalidateOptions) => void;
  setData: (updater: Updater<TQueryFnData | undefined, TQueryFnData | undefined>, options?: SetDataOptions) => TQueryFnData | undefined;
  getData: (filters?: QueryFilters) => TQueryFnData | undefined;
  queryClient: QueryClient,
} & (
  TVariables extends undefined 
  ? {  } 
  : { variables: TVariables; }
);

type UseCreatedQuery<
  TVariables = unknown, 
  TQueryFnData = unknown, 
  TError = unknown, 
  TData = TQueryFnData, 
  TQueryKey extends QueryKey = QueryKey
> = TVariables extends undefined
  ? <TRData = TData>(options?: QueryOptions<TVariables, TQueryFnData,  TError, TRData, TQueryKey>) => CreateQueryResult<TVariables, TQueryFnData, TRData, TError> 
  : <TRData = TData>(options: QueryOptions<TVariables, TQueryFnData,  TError, TRData, TQueryKey>) => CreateQueryResult<TVariables, TQueryFnData, TRData, TError>


export const createQuery = <
  TVariables = undefined, 
  TQueryFnData = unknown, 
  TError = unknown, 
  TData = TQueryFnData, 
  TQueryKeyVariables extends unknown[] = unknown[]
>(
  useQueryOptions: CreateQueryOptions<TVariables, TQueryFnData, TError, TData, TQueryKeyVariables>,
) => {
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

  const useCreatedQuery: UseCreatedQuery<TVariables, TQueryFnData,  TError, TData, UnionFlatten<string, TQueryKeyVariables>> = 
  ((options: any) => {
    const queryClient = useQueryClient({ context: useQueryOptions?.context });
    const queryKey = queryKeyFn(options?.variables)
    
    const invalidate = useCallback(
      (options?: QueryInvalidateOptions) => {
        queryClient.invalidateQueries({
          queryKey,
          ...options,
        });
      },
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
  });
}

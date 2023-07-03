import { useCallback } from "react";
import {
  ContextOptions,
  InvalidateQueryFilters,
  QueryFunction,
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
  queryFn: QueryFunction<TQueryFnData, UnionFlatten<string, TQueryKeyVariables>>;
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
  "queryHash" | "queryKeyHashFn" | "queryKey" | "queryFn"
> & (
  TVariables extends undefined 
  ? {  } 
  : { variables: TVariables; }
);

export type QueryInvalidateOptions = Omit<InvalidateQueryFilters, "queryKey">;

export type CreateQueryResult<TVariables, TQueryData, TQueryFnData, TError> = UseQueryResult<TQueryData, TError> & {
  queryPrimaryKey: string,
  queryKey: QueryKey;
  invalidate: (options?: QueryInvalidateOptions) => void;
  setData: (updater: Updater<TQueryData | undefined, TQueryData | undefined>, options?: SetDataOptions) => TQueryFnData | undefined;
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
  ? (options?: QueryOptions<TVariables, TQueryFnData,  TError, TData, TQueryKey>) => CreateQueryResult<TVariables, TData, TQueryFnData, TError> 
  : (options: QueryOptions<TVariables, TQueryFnData,  TError, TData, TQueryKey>) => CreateQueryResult<TVariables, TData, TQueryFnData, TError>


export const createQuery = <
  TVariables = undefined, 
  TQueryFnData = unknown, 
  TError = unknown, 
  TData = TQueryFnData, 
  TQueryKeyVariables extends unknown[] = unknown[]
>(
  useQueryOptions: CreateQueryOptions<TVariables, TQueryFnData, TError, TData, TQueryKeyVariables>,
  queryClientOptions: ContextOptions = {},
) => {
  const { queryPrimaryKey, queryKeyVariables: queryKeyVariables, ...otherOptions } = useQueryOptions;

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
    const queryClient = useQueryClient(queryClientOptions);
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

    const useQueryResult = useQuery<TQueryFnData, TError, TData, UnionFlatten<string, TQueryKeyVariables>>({
      queryKey,
      ...otherOptions,
      ...options,
    });

    return Object.assign(useQueryResult, {
      queryPrimaryKey,
      queryKey,
      invalidate,
      setData,
      variables: options?.variables,
    });
  }) as any;

  return Object.assign(useCreatedQuery, {
    queryPrimaryKey,
    queryKey: queryKeyFn,
    queryFn: useQueryOptions.queryFn,
    queryHash: useQueryOptions.queryHash,
    queryKeyHashFn: useQueryOptions.queryKeyHashFn,
  });
}

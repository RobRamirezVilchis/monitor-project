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
  TArgs = unknown, 
  TQueryFnData = unknown, 
  TError = unknown, 
  TData = TQueryFnData, 
  TQueryKeyArgs extends unknown[] = unknown[]
> = 
Omit<
  UseQueryOptions<
    TQueryFnData,
    TError,
    TData,
    UnionFlatten<string, TQueryKeyArgs>
  >,
  "queryKey" | "queryFn"
> & {
  queryPrimaryKey: string;
  queryKeyArgs?: (TArgs extends undefined ? (() => TQueryKeyArgs) : ((args: TArgs) => TQueryKeyArgs));
  queryFn: QueryFunction<TQueryFnData, UnionFlatten<string, TQueryKeyArgs>>;
};

export type QueryOptions<
  TArgs = unknown, 
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
  TArgs extends undefined 
  ? {  } 
  : { args: TArgs; }
);

export type QueryInvalidateOptions = Omit<InvalidateQueryFilters, "queryKey">;

export type CreateQueryResult<TArgs, TQueryData, TQueryFnData, TError> = UseQueryResult<TQueryData, TError> & {
  queryPrimaryKey: string,
  queryKey: QueryKey;
  invalidate: (options?: QueryInvalidateOptions) => void;
  setData: (updater: Updater<TQueryData | undefined, TQueryData | undefined>, options?: SetDataOptions) => TQueryFnData | undefined;
} & (
  TArgs extends undefined 
  ? {  } 
  : { args: TArgs; }
);

type UseCreatedQuery<
  TArgs = unknown, 
  TQueryFnData = unknown, 
  TError = unknown, 
  TData = TQueryFnData, 
  TQueryKey extends QueryKey = QueryKey
> = TArgs extends undefined
  ? (options?: QueryOptions<TArgs, TQueryFnData,  TError, TData, TQueryKey>) => CreateQueryResult<TArgs, TData, TQueryFnData, TError> 
  : (options: QueryOptions<TArgs, TQueryFnData,  TError, TData, TQueryKey>) => CreateQueryResult<TArgs, TData, TQueryFnData, TError>


export const createQuery = <
  TArgs = undefined, 
  TQueryFnData = unknown, 
  TError = unknown, 
  TData = TQueryFnData, 
  TQueryKeyArgs extends unknown[] = unknown[]
>(
  useQueryOptions: CreateQueryOptions<TArgs, TQueryFnData, TError, TData, TQueryKeyArgs>,
  queryClientOptions: ContextOptions = {},
) => {
  const { queryPrimaryKey, queryKeyArgs, ...otherOptions } = useQueryOptions;

  const queryKeyFn: (
    TArgs extends undefined 
    ? (() => UnionFlatten<string, TQueryKeyArgs>) 
    : ((args: TArgs) => UnionFlatten<string, TQueryKeyArgs>)
  ) = 
  ((args: any) => {
    const qArgs = queryKeyArgs?.(args);
    return qArgs ? [queryPrimaryKey, ...qArgs] : [queryPrimaryKey];
  }) as any;

  const useCreatedQuery: UseCreatedQuery<TArgs, TQueryFnData,  TError, TData, UnionFlatten<string, TQueryKeyArgs>> = 
  ((options: any) => {
    const queryClient = useQueryClient(queryClientOptions);
    const queryKey = queryKeyFn(options?.args)
    
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

    const useQueryResult = useQuery<TQueryFnData, TError, TData, UnionFlatten<string, TQueryKeyArgs>>({
      queryKey,
      ...otherOptions,
      ...options,
    });

    return Object.assign(useQueryResult, {
      queryPrimaryKey,
      queryKey,
      invalidate,
      setData,
      args: options?.args,
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

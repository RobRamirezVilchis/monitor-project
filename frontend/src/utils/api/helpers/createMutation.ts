import { 
  MutationFunction,
  MutationKey,
  QueryClient,
  UseMutationOptions, 
  UseMutationResult, 
  useMutation,
  useQueryClient, 
} from "@tanstack/react-query"

export type CreateMutationOptions<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
> =
Omit<
  UseMutationOptions<
    TData,
    TError,
    TVariables,
    TContext
  >,
  "mutationFn"
> & {
  mutationFn: MutationFunction<TData, TVariables>;
};

export type MutationsOptions<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
> =
Omit<
  UseMutationOptions<
    TData,
    TError,
    TVariables,
    TContext
  >,
  "mutationKey" | "mutationFn" | "context"
>;

export type CreateMutationResult<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
> = UseMutationResult<TData, TError, TVariables, TContext> & {
  mutationKey?: MutationKey;
  mutationFn: MutationFunction<TData, TVariables>;
  queryClient: QueryClient;
};

export type UseCreatedMutation<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
> = (options?: MutationsOptions<TData, TError, TVariables, TContext>) => CreateMutationResult<TData, TError, TVariables, TContext>;


export const createMutation = <TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(
  useMutationOptions: CreateMutationOptions<TData, TError, TVariables, TContext>,
) => {
  
  const useMutationResult: UseCreatedMutation<TData, TError, TVariables, TContext> = (options) => {
    const queryClient = useQueryClient({ context: useMutationOptions?.context });
    const mutation = useMutation({
      ...useMutationOptions,
      ...options,
    });

    return Object.assign(mutation, {
      mutationKey: useMutationOptions.mutationKey,
      mutationFn: useMutationOptions.mutationFn,
      queryClient,
    });
  }

  return Object.assign(useMutationResult, {
    mutationKey: useMutationOptions.mutationKey,
    mutationFn: useMutationOptions.mutationFn,
    context: useMutationOptions.context,
  });
}

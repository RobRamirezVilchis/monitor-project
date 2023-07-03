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
    const mutation = useMutation<TData, TError, TVariables, TContext>({
      ...useMutationOptions,
      ...options,
      onMutate: async (variables) => {
        useMutationOptions?.onMutate?.(variables);
        options?.onMutate?.(variables);
      },
      onSuccess: async (data, variables, context) => {
        useMutationOptions?.onSuccess?.(data, variables, context);
        options?.onSuccess?.(data, variables, context);
      },
      onError: async (error, variables, context) => {
        useMutationOptions?.onError?.(error, variables, context);
        options?.onError?.(error, variables, context);
      },
      onSettled: async (data, error, variables, context) => {
        useMutationOptions?.onSettled?.(data, error, variables, context);
        options?.onSettled?.(data, error, variables, context);
      },
    } as UseMutationOptions<TData, TError, TVariables, TContext>);

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

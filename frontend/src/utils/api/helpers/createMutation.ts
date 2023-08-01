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
  TPContext = unknown,
  TContext = unknown,
> =
Omit<
  UseMutationOptions<
    TData,
    TError,
    TVariables,
    TContext
  >,
  "mutationKey" | "mutationFn" | "context" | "onMutate"
> & {
  onMutate?: TPContext extends undefined 
  ? (
    variables: TVariables,
  ) => Promise<TContext | undefined> | TContext | undefined
  : (
    variables: TVariables, 
    parentContext: TPContext extends undefined ? undefined : TPContext
  ) => Promise<TContext | undefined> | TContext | undefined;
};

export type UseCreatedMutationResult<
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
> = <TOverrideContext = TContext>(options?: MutationsOptions<TData, TError, TVariables, TContext, TOverrideContext>) => UseCreatedMutationResult<TData, TError, TVariables, TOverrideContext>;


export function createMutation<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(
  useMutationOptions: CreateMutationOptions<TData, TError, TVariables, TContext>,
) {
  const useMutationResult: UseCreatedMutation<TData, TError, TVariables, TContext> = <TOverrideContext = TContext>(options?: MutationsOptions<TData, TError, TVariables, TContext, TOverrideContext>) => {
    const queryClient = useQueryClient({ context: useMutationOptions?.context });
    const mutation = useMutation<TData, TError, TVariables, TOverrideContext>({
      ...useMutationOptions,
      ...options,
      onMutate: async (variables) => {
        const pCtx = await useMutationOptions?.onMutate?.(variables);
        return options?.onMutate?.(variables, pCtx as any);
      },
      onSuccess: (data, variables, context) => {
        return Promise.all([
          useMutationOptions?.onSuccess?.(data, variables, context as any),
          options?.onSuccess?.(data, variables, context),
        ]);
      },
      onError: (error, variables, context) => {
        return Promise.all([
          useMutationOptions?.onError?.(error, variables, context as any),
          options?.onError?.(error, variables, context),
        ]);
      },
      onSettled: (data, error, variables, context) => {
        return Promise.all([
          useMutationOptions?.onSettled?.(data, error, variables, context as any),
          options?.onSettled?.(data, error, variables, context),
        ]);
      },
    } as UseMutationOptions<TData, TError, TVariables, TOverrideContext>);

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

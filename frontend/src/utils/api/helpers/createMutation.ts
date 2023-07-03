import { 
  UseMutationOptions, 
  useMutation, 
} from "@tanstack/react-query"


export const createMutation = <TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>,
) => {
  
  const useMutationResult = () => {
    const mutation = useMutation(options);

    return Object.assign(mutation, {
      mutationKey: options.mutationKey,
      mutationFn: options.mutationFn,
    });
  }

  return Object.assign(useMutationResult, {
    mutationKey: options.mutationKey,
    mutationFn: options.mutationFn,
  });
}

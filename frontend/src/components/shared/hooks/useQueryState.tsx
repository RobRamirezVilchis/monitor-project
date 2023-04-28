import { Router, useRouter } from "next/router";
import { useCallback, useMemo, useRef } from "react";

export type QueryParam<Type> = {
  defaultValue?: Type;
} & ({
  multiple?: false;
  parse?: (param: string) => Type;
  serialize?: (value: Type) => string;
} | {
  multiple: true;
  parse?: (param: string[]) => Type[];
  serialize?: (value: Type[]) => string[];
})

export type QueryParams<T> = {
  [Key in keyof T]: QueryParam<T[Key]>;
};

export type TransitionOptions = Parameters<Router["push"]>[2];

export type QueryStateOptions = {
  /**
   * Set the behavior of the router history
   * @default: "push"
   */
  history?: "push" | "replace";
  transitionOptions?: TransitionOptions; 
}

export type DispatchState<T> = (value: Partial<T>) => void;

export type ResetState<T> = (param?: keyof T) => void;

export type UseQueryStateReturn<T> = {
  state: T;
  update: DispatchState<T>;
  /**
  * Reset the param or all of them to their default value, if no default value exist,
  * they're set to undefined EVEN when they're not marked as optional!
  * @param param 
  */
  reset: ResetState<T>;
}

/**
 * Hook to sync url query params with state
 * @param params Object containing query params information to be controlled by the hook
 * @param options Configuration like history behavior or transition options when useNativeHistory is false/undefined
 * @returns An object containing the params state, a dispatch function to update params, a reset function and a isReady property
 */
export function useQueryState<T extends Record<string, any> = Record<string, any>>(
  params: QueryParams<T>,
  options?: QueryStateOptions
): UseQueryStateReturn<T> {
  const router = useRouter();

  const initState = useMemo(() => {
    const queryParams = router.query;
    const initState: any = {  };

    Object.keys(params).forEach(key => {
      const param = params[key as keyof typeof params];

      let queryValue = queryParams[key];

      if (queryValue !== undefined && param?.parse)
        queryValue = param.parse(queryValue as any);
      else if (queryValue === undefined && param?.defaultValue !== undefined)
       queryValue = param.defaultValue;

      initState[key] = queryValue;
    });

    return initState;
  }, []);
  const state = useRef<T>(initState);

  const pushQueryParams = useCallback((values: T) => { 
    const currQuery = router.query;

    let updatedQueryParams: Record<string, any> = {};
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined) {
        const param = params[key as keyof typeof params];
        const serializedValue = param?.serialize ? param.serialize(value) : value;
        updatedQueryParams[key] = serializedValue;
      }
      else {
        delete currQuery[key];
      }
    });

    const func = options?.history === "replace" ? router.replace : router.push;
    func({
        pathname: window.location.pathname,
        query: {
          ...currQuery,
          ...updatedQueryParams,
        }
      },
      undefined,
      options?.transitionOptions
    );
  }, []);

  const update = (value: Partial<T>) => {
    state.current = { ...state.current, ...value };
    pushQueryParams(state.current);
  };

  const reset = (param?: keyof T) => {
    if (param !== undefined) {
      state.current[param] = params[param].defaultValue!;
    }
    else {
      Object.keys(params).forEach(key => state.current[key as keyof T] = params[key].defaultValue!);
    }
    pushQueryParams(state.current);
  };

  return { 
    state: state.current, 
    update, 
    reset, 
  };
}

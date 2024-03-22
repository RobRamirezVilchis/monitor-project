"use client";

import { useCallback, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { NavigateOptions } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Nullable } from "@/utils/types";

export type QueryParam<Type> = {
  defaultValue: Type;
  /**
   * If true, the `getAll` method will be used to get the param value
   * instead of the `get` method, this is useful when the param is a list
   * @default: false
   */
  multiple?: boolean;
  /**
   * Parse the param value from the url before storing it in the state
   * @param param The param value to be parsed, it will be an array if multiple is true
   * @returns The parsed value
   */
  parse?: (param: string[] | string) => Type;
  /**
   * Serialize the param value before storing it in the url
   * @param value The param value to be serialized
   * @returns The serialized value, it expects an array if multiple is true
   */
  serialize?: (value: Type) => string[] | string;
} 

export type QueryParams<T> = {
  [Key in keyof T]: QueryParam<T[Key]>;
};

export type QueryStateOptions = {
  /**
   * Set the behavior of the router history
   * @default: "push"
   */
  history?: "push" | "replace";
  navigateOptions?: NavigateOptions;
   /** 
   * If true, empty values such as empty strings, null, undefined, 
   * or empty arrays, will be removed from the url query params.
   * @default: true
   */
  removeEmptyFromUrl?: boolean;
}

export type DispatchState<T> = {
  (value: T): void;
  (value: (prev: T) => T): void;
};

export type DispatchPartialState<T> = {
  (value: Partial<T>): void;
  (value: (prev: T) => Partial<T>): void;
};

export type ResetState<T> = (...paramKeys: (keyof T)[]) => void;

export type UseQueryStateReturn<T> = {
  /**
   * The current state of the params
   */
  state: T;
  /**
   * Update only the given param(s) to the given value
   * @param value
   * @example
   * update({ param: "new value" }); // update `param` to "new value"
   * update({ param1: 1, param2: 2 }); // update `param1` and `param2` to 1 and 2 respectively
   * update(prev => ({ param: prev.param + 1 })); // increment `param` by 1
   */
  update: DispatchPartialState<T>;
  /**
   * Set the param(s) to the given state
   * @param value
   * @example
   * set(newState); // set all params to the given state
   */
  set: DispatchState<T>;
  /**
   * Reset the param(s) or all of them to their default value or null
   * @param param 
   * @example
   * reset("param"); // reset param to its default value
   * reset("param1", "param2"); // reset param1 and param2 to their default value
   * reset(); // reset all params to their default value
   */
  reset: ResetState<T>;
}

/**
 * Hook to sync url query params with state
 * @param params Object containing query params information to be controlled by the hook
 * @param options Configuration like history behavior or navigate options
 * @returns An object containing the params state, a dispatch function to update params and a reset function
 */
export function useQueryState<T extends Record<string, any> = Record<string, any>>(
  params: QueryParams<T>,
  options?: QueryStateOptions
): UseQueryStateReturn<T> {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    removeEmptyFromUrl = true,
  } = options ?? {};

  const initState = useMemo(() => Object.keys(params).reduce((acc, key) => {
    const param = params[key as keyof typeof params];
    let queryValue = param.multiple ? searchParams?.getAll(key) : searchParams?.get(key);
    if (queryValue === null || (param.multiple && (queryValue as string[])?.length === 0))
      queryValue = param.defaultValue;
    else if (param?.parse)
      queryValue = param.parse(queryValue as any);
    
    acc[key] = queryValue;
    return acc;
  }, {} as any), [params, searchParams]);

  const state = useRef<T>(initState);

  const updateUrlQueryParams = useCallback((values: T) => {
    state.current = values;

    if (!searchParams) return;

    const updatedQueryParams = new URLSearchParams(searchParams.toString());

    Object.keys(params).forEach(key => {
      const value = values[key];

      if (removeEmptyFromUrl
        && (value === undefined
        || value === null
        || value === ""
        || (Array.isArray(value) && value.length === 0))
      ) {
        updatedQueryParams.delete(key);
      }
      else {
        const param = params[key as keyof typeof params];
        const serializedValue = param.serialize?.(value) ?? value;
        updatedQueryParams.set(key, serializedValue);
      }
    })

    Object.entries(values).forEach(([key, value]) => {
      if (removeEmptyFromUrl
        && (value === undefined
        || value === null
        || value === ""
        || (Array.isArray(value) && value.length === 0))
      ) {
        updatedQueryParams.delete(key);
      }
      else {
        const param = params[key as keyof typeof params];
        const serializedValue = param.serialize?.(value) ?? value;
        updatedQueryParams.set(key, serializedValue);
      }
    });

    const updateRouteParams = options?.history === "replace" ? router.replace : router.push;
    const url = new URL(window.location.pathname, window.location.origin);
    url.search = updatedQueryParams.toString();
    updateRouteParams(url.toString(), options?.navigateOptions);
  }, [searchParams, options?.history, options?.navigateOptions, removeEmptyFromUrl, router.replace, router.push, params]);

  const update: DispatchPartialState<T> = (value) => {
    const newPartialValue = typeof value === "function" ? value(state.current) : value;
    updateUrlQueryParams({ ...state.current, ...newPartialValue });
  };

  const set: DispatchState<T> = (value) => {
    const newValue = typeof value === "function" ? value(state.current) : value;
    updateUrlQueryParams(newValue);
  }

  const reset: ResetState<T> = (...paramKeys) => {
    (paramKeys.length > 0 ? paramKeys : Object.keys(params))
      .forEach(key => state.current[key] = params[key].defaultValue);
    updateUrlQueryParams(state.current);
  };

  return { 
    state: state.current, 
    update,
    set,
    reset, 
  };
}

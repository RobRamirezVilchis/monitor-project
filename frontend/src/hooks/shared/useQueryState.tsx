"use client";

import { useCallback, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { NavigateOptions } from "next/dist/shared/lib/app-router-context";
import { Nullable } from "@/utils/types";

export type QueryParam<Type> = {
  defaultValue: Type | null;
  /**
   * If true, the getAll method will be used to get the param value
   * instead of the get method
   */
  multiple?: boolean;
  /**
   * Parse the param value before storing it in the state
   * @param param 
   * @returns 
   */
  parse?: (param: Type extends Array<infer T> ? string[] : string) => Type;
  /**
   * Serialize the param value before storing it in the url
   * @param value
   */
  serialize?: (value: Type) => Type extends Array<infer T> ? string[] : string;
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
}

export type DispatchState<T> = {
  (value: Partial<Nullable<T>>):void;
  (value: (prev: T) => Partial<Nullable<T>>): void;
};

export type ResetState<T> = (param?: keyof T | (keyof T)[]) => void;

export type UseQueryStateReturn<T> = {
  state: T;
  /**
   * Update the param(s) to the given value
   * if the value is null, the param will be removed from the url
   * and the default value will be stored in the state
   * @param value
   * @example
   * update({ param: "new value" }); // update param to "new value"
   * update({ param: null }); // remove param from url and set it to its default value
   */
  update: DispatchState<T>;
  /**
    * Reset the param(s) or all of them to their default value or null
    * @param param 
    * @example
    * reset("param"); // reset param to its default value
    * reset(["param1", "param2"]); // reset param1 and param2 to their default value
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

  const initState = useMemo(() => {
    const init: any = {  };

    Object.keys(params).forEach((key) => {
      const param = params[key as keyof typeof params];

      let queryValue = param.multiple ? searchParams?.getAll(key) : searchParams?.get(key);

      if (queryValue !== null && param?.parse)
        queryValue = param.parse(queryValue as any);
      else if (queryValue === null)
        queryValue = param.defaultValue;

      init[key] = queryValue;
    });
      
    return init;
  }, [params, searchParams]);

  const state = useRef<T>(initState);

  const pushQueryParams = useCallback((values: T) => { 
    if (!searchParams) return;

    const updatedQueryParams = new URLSearchParams(searchParams.toString());

    Object.entries(values).forEach(([key, value]) => {
      if (value === null) {
        updatedQueryParams.delete(key);
      }
      else {
        const param = params[key as keyof typeof params];
        const serializedValue = param?.serialize ? param.serialize(value) : value;
        updatedQueryParams.set(key, serializedValue);
      }
    });

    const updateRouteParams = options?.history === "replace" ? router.replace : router.push;
    const url = new URL(window.location.pathname, window.location.origin);
    url.search = updatedQueryParams.toString();
    updateRouteParams(url.toString(), options?.navigateOptions);
  }, [params, options?.history, options?.navigateOptions, router, searchParams]);

  const update: DispatchState<T> = (value) => {
    const newValue = typeof value === "function" ? value(state.current) : value;
    state.current = { ...state.current, ...newValue };
    pushQueryParams(state.current);
  };

  const reset: ResetState<T> = (param) => {
    if (param !== undefined) {
      if (typeof param === "string")
        state.current[param as keyof T] = params[param].defaultValue!;
      else
        (param as (keyof T)[]).forEach(key => state.current[key] = params[key].defaultValue!);
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

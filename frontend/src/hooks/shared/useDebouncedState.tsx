"use client";

import { Dispatch, ReducerWithoutAction, SetStateAction, useCallback, useState } from "react";

import { useDebounce } from "./useDebounce";

export interface UseDebouncedStateOptions<T extends unknown> {
  initialState: T | (() => T);
  /**
   * Time in ms before the callback is called if the debounce 
   * function is not called before the time is elapsed.
   * @default 500
   */
  debounceTime?: number;
  /**
   * If true, the callback is called immediately before the debounce starts.
   * @default false
   */
  immediate?: boolean;
}

/**
 * Debounces value changes after a given debounce time has elapsed and the debounce function has not been called again.
 * @returns an object containing the debounced value and a function to set the debounced value and a function to cancel the debounce
 */
export const useDebouncedState = <T extends unknown>({
  debounceTime = 500,
  initialState,
  immediate = false,
}: UseDebouncedStateOptions<T>) => {
  const [state, callback] = useState<T>(initialState);
  const { debounce, cancel } = useDebounce({
    debounceTime,
    callback,
    immediate,
  });

  return {
    state, 
    debounce,
    cancel,
  };
}

/**
 * Debounce value changes while also keeping track of non-debounced values.
 * The value is only updated after the debounce time has elapsed and the debounce function has not been called again.
 * @returns an object containing the debounced and non-debounced values, a function to set the debounced value and a function to cancel the debounce
 */
export const useControlledDebouncedState = <T extends unknown>({
  debounceTime = 500,
  initialState,
  immediate = false,
}: UseDebouncedStateOptions<T>) => {
  const [state, _setState] = useState<T>(initialState);
  const [debouncedState, setDebouncedState] = useState<T>(initialState);
  
  const { debounce, cancel: cancelDebounce } = useDebounce({
    debounceTime,
    callback: setDebouncedState,
    immediate,
  });

  const setState = useCallback<Dispatch<SetStateAction<T>>>((value) => {
    if (typeof value === "function") {
      const updater = value as ReducerWithoutAction<T>;
      _setState(prev => {
        const newValue = updater(prev);
        debounce(newValue);
        return newValue;
      });
    }
    else {
      _setState(value);
      debounce(value);
    }
  }, [debounce]);

  return {
    state, 
    debouncedState, 
    setState,
    cancelDebounce,
  };
};

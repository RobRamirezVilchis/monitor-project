"use client";

import { useState, Dispatch, SetStateAction, useCallback, ReducerWithoutAction } from "react";

import { useDebounce } from "./useDebounce";

export interface UseDebouncedValueOptions<T extends unknown> {
  /**
 * Time in ms before the callback is called if the debounce 
 * function is not called before the time is elapsed.
 * @default 500
 */
  debounceTime?: number;
  initialValue: T | (() => T);
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
export const useDebouncedValue = <T extends unknown>({
  debounceTime = 500,
  initialValue,
  immediate = false,
}: UseDebouncedValueOptions<T>) => {
  const [value, callback] = useState<T>(initialValue);
  const { debounce, cancel } = useDebounce({
    debounceTime,
    callback,
    immediate,
  });

  return {
    value, 
    debounce,
    cancel,
  };
}

/**
 * Debounce value changes while also keeping track of non-debounced values.
 * The value is only updated after the debounce time has elapsed and the debounce function has not been called again.
 * @returns an object containing the debounced and non-debounced values, a function to set the debounced value and a function to cancel the debounce
 */
export const useControlledDebouncedValue = <T extends unknown>({
  debounceTime = 500,
  initialValue,
  immediate = false,
}: UseDebouncedValueOptions<T>) => {
  const [state, setState] = useState<T>(initialValue);
  const [debouncedState, setDebouncedState] = useState<T>(initialValue);
  
  const { debounce, cancel: cancelDebounce } = useDebounce({
    debounceTime,
    callback: setDebouncedState,
    immediate,
  });

  const setValue = useCallback<Dispatch<SetStateAction<T>>>((value) => {
    if (typeof value === "function") {
      const updater = value as ReducerWithoutAction<T>;
      setState(prev => {
        const newValue = updater(prev);
        debounce(newValue);
        return newValue;
      });
    }
    else {
      setState(value);
      debounce(value);
    }
  }, [debounce]);

  return {
    value: state, 
    debouncedValue: debouncedState, 
    setValue,
    cancelDebounce,
  };
};

"use client";

import { useCallback, useEffect, useRef } from "react";

export interface UseDebounceOptions<T extends unknown[]> {
  /**
   * Time in ms before the callback is called if the debounce 
   * function is not called before the time is elapsed.
   * @default 500
   */
  debounceTime?: number;
  callback: (...args: T) => void;
  /**
   * If true, the callback is called immediately before the debounce starts.
   * @default false
   */
  immediate?: boolean;
}

export const useDebounce = <T extends unknown[]>({
  debounceTime = 500,
  callback,
  immediate = false,
}: UseDebounceOptions<T>) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  const immediateCall = useRef(true);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const cancel = useCallback(() => {
    if (timeoutRef.current)
      clearTimeout(timeoutRef.current);
  }, []);

  const debounce = useCallback((...args: T) => {
    if (timeoutRef.current)    cancel();
    if (immediate && immediateCall.current) {
      callbackRef.current(...args);
      immediateCall.current = false;
    }
    else {
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
        immediateCall.current = true;
      }, debounceTime);
    }
  }, [cancel, timeoutRef, debounceTime, immediate]);

  useEffect(() => {
    return () => cancel();
  }, [cancel]);

  return { 
    debounce,
    cancel
  };
}

"use client";

import { useCallback, useRef, useEffect } from "react";

export interface UseDebounceOptions<T extends unknown[]> {
  /**
   * Time in ms before the callback is called if the debounce 
   * function is not called before the time is elapsed.
   * @default 500
   */
  debounceTime?: number;
  callback: (...args: T) => void;
}

export const useDebounce = <T extends unknown[]>({
  debounceTime = 500,
  callback,
}: UseDebounceOptions<T>) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debounce = useCallback((...args: T) => {
    if (timeoutRef.current)
      clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => callbackRef.current(...args), debounceTime);
  }, [timeoutRef, debounceTime]);

  const cancel = useCallback(() => {
    if (timeoutRef.current)
      clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    return () => cancel();
  }, [cancel]);

  return { 
    debounce,
    cancel
  };
}

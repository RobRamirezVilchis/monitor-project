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
  const timeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeout.current)
        clearTimeout(timeout.current);
    }
  }, []);

  const debounce = useCallback((...args: T) => {
    if (timeout.current)
      clearTimeout(timeout.current);

    timeout.current = setTimeout(() => callback(...args), debounceTime);
  }, [timeout, debounceTime, callback]);

  return debounce;
}

import { useCallback, useRef, useEffect } from "react";

export const useDebounce = (options?: {
  /**
   * Time in ms before the callback is called if the debounce 
   * function is not called before the time is elapsed.
   * @default 500
   */
  debounceTime?: number,
  callback: () => void,
}) => {
  const timeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeout.current)
        clearTimeout(timeout.current);
    }
  }, []);

  const debounce = useCallback(() => {
    if (timeout.current)
      clearTimeout(timeout.current);

    const opts: typeof options = {
      debounceTime: 500,
      callback: () => {},
      ...options,
    };

    timeout.current = setTimeout(opts.callback, opts.debounceTime);
  }, [timeout, options]);

  return debounce;
}
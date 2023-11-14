import { useCallback, useEffect, useRef, useState } from "react";

export interface UseDebouncedValueOptions {
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
 * @param value The value to debounce after each change
 * @param options Options for the debounce
 * @returns A tuple containing the debounced value and a function to cancel the debounce
 */
export const useDebouncedValue = <T extends unknown>(
  value: T,
  options?: UseDebouncedValueOptions,
): [T, () => void] => {
  const {
    debounceTime = 500,
    immediate = false,
  } = options || {};

  const [debounced, setValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const immediateCall = useRef(true);
  const firstDebounce = useRef(true);

  useEffect(() => {
    // Reset due to refs not restoring properly in strict mode
    return () => {
      firstDebounce.current = true;
    };
  }, []);

  const clearDebounce = () => {
    if (timeoutRef.current)
     clearTimeout(timeoutRef.current);
  };

  const cancel = useCallback(() => {
    clearDebounce();
    immediateCall.current = true;
  }, []);

  useEffect(() => {
    clearDebounce();

    if (immediate && immediateCall.current) {
      setValue(value);
      if (firstDebounce.current) {
        firstDebounce.current = false;
        immediateCall.current = true;
      }
      else {
        immediateCall.current = false;

        timeoutRef.current = setTimeout(() => {
          immediateCall.current = true;
          clearDebounce();
        }, debounceTime);
      }
    }
    else {
      timeoutRef.current = setTimeout(() => {
        setValue(value);
        immediateCall.current = true;
        clearDebounce();
      }, debounceTime);
    }
  }, [debounceTime, immediate, value]);


  return [debounced, cancel];
}

import { useEffect, useRef } from "react"

export const usePrevious = <T extends unknown>(value: T) => {
  const previous = useRef<T | undefined>();

  useEffect(() => {
    previous.current = value;
  }, [value]);

  return previous.current;
}

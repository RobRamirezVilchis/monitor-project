import { useCallback, useEffect, useRef } from "react";

/**
 * @returns A function that returns true if the component is mounted and false otherwise
 */
export const useIsMounted = () => {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  return useCallback(() => isMounted.current, []);
}
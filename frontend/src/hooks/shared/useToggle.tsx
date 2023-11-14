"use client";

import { useCallback, useMemo, useState } from "react";

export type UseToggleOptions<T = boolean, S extends readonly T[] = readonly T[]> = {
  initialValue?: T extends boolean ? boolean : T;
} & (T extends boolean ? { options?: never;  } : { options: S });

/**
 * A hook that returns a toggle state with functions to toggle and set the state.
 * @param initialValue The initial value of the toggle (defaults to false)
 */
export const useToggle = <T extends unknown = boolean, S extends readonly T[] = readonly T[]>(
  options?: UseToggleOptions<T, S>
): [T, (value?: T extends boolean ? boolean : T) => void] => {
  const {
    initialValue,
    options: _options,
  } = options ?? {};

  const toggleOptions = useMemo<S>(
    () => _options !== undefined 
      ? _options as S 
      : [false, true] as unknown as S, 
    [_options]
  );
  const [index, setIndex] = useState(() => {
    if (initialValue !== undefined) {
      const newIndex = toggleOptions.findIndex(option => option === initialValue);
      if (newIndex !== -1) return newIndex;
    }
    return 0;
  });

  const toggle = useCallback((value?: T extends boolean ? boolean : T) => {
    if (value !== undefined) {
      const newIndex = toggleOptions.findIndex(option => option === value);
      if (newIndex !== -1) setIndex(newIndex);
    }
    else {
      setIndex(prev => prev === toggleOptions.length - 1 ? 0 : prev + 1);
    }
  }, [toggleOptions])

  return [toggleOptions[index], toggle];
}

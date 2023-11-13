"use client";

import { useCallback, useState } from "react";

export interface UseToggleDispatchers {
  toggle: (value?: boolean) => void;
  setOn: () => void;
  setOff: () => void;
}

/**
 * A hook that returns a toggle state with functions to toggle and set the state.
 * @param initialValue The initial value of the toggle (defaults to false)
 */
export const useToggle = (
  initialValue: boolean = false
): [boolean, UseToggleDispatchers] => {
  const [state, setState] = useState(initialValue);

  const toggle = useCallback((value?: boolean) => {
    if (value !== undefined)
      setState(value);
    else
      setState(prev => !prev);
  }, [])

  const setOn = useCallback(() => setState(true), []);

  const setOff = useCallback(() => setState(false), []);

  return [state, { toggle, setOn, setOff }];
}

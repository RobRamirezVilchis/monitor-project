import { EffectCallback, useEffect } from "react";

/**
 * Calls the effect function on mount, allowing returning a function to call on unmount.
 * @param effect the effect function to call on mount.
 */
export const useOnMount = (effect: EffectCallback) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, []);
}

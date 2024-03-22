import { EffectCallback, useEffect } from "react";

/**
 * Calls the effect function on unmount.
 * @param effect the effect function to call on unmount.
 */
export const useOnUnmount = (effect: Exclude<ReturnType<EffectCallback>, void>) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => effect, []);
};

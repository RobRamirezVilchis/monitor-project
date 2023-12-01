import { EffectCallback, useEffect, useLayoutEffect } from "react";

import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

/**
 * Calls the effect function on mount, allowing returning a function to call on unmount.
 * @param effect the effect function to call on mount.
 */
export const useOnMount = (effect: EffectCallback) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, []);
}

/**
 * Calls the effect function on layout mount, allowing returning a function to call on unmount.
 * @param effect the effect function to call on mount.
 */
export const useOnLayoutMount = (effect: EffectCallback) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(effect, []);
}

/**
 * Calls the effect function on layout mount on the client and on mount on the server, allowing returning a function to call on unmount.
 * @param effect the effect function to call on mount.
 */
export const useOnIsomorphicLayoutMount = (effect: EffectCallback) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useIsomorphicLayoutEffect(effect, []); 
}

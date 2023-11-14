import { DependencyList, EffectCallback, useEffect } from "react";
import { useIsFirstRender } from "./useIsFirstRender";

export const useOnUpdate = (effect: EffectCallback, deps: DependencyList = []) => {
  const isFirstRender = useIsFirstRender();

  useEffect(() => {
    !isFirstRender && effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
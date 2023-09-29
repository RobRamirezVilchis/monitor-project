import { ForwardedRef, Ref, useCallback } from "react";

export function assignRef<T = any>(ref: ForwardedRef<T>, value: T | null) {
  if (typeof ref === "function")
    ref(value);
  else if (ref !== null)
    ref.current = value;
}

export function mergeRefs<T = any>(...refs: Ref<T>[]) {
  return (node: T | null) => {
    refs.forEach((ref) => assignRef(ref, node));
  };
}

export const useMergedRef = <T = any>(...refs: Ref<T>[]) => {
  /* eslint-disable react-hooks/exhaustive-deps */
  const merged = useCallback(mergeRefs(...refs), refs);
  /* eslint-enable react-hooks/exhaustive-deps */
  return merged;
}
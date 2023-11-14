import { useRef } from 'react'

/**
 * @returns True if the component is rendered for the first time, false otherwise
 */
export function useIsFirstRender() {
  const isFirstRender = useRef(true)

  if (isFirstRender.current) {
    isFirstRender.current = false;

    return true;
  }

  return isFirstRender.current
}
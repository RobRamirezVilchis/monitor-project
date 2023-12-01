import { useEffect, useLayoutEffect } from "react";

/**
 * Uses the layout effect on the client and the normal effect on the server.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" 
  ? useLayoutEffect 
  : useEffect;

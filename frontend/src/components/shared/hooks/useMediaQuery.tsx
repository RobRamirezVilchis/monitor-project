"use client";

import { useEffect, useState } from "react";

/**
 * Media Query hook.
 * @param query the media query to match, for example (min-width: 1024px).
 * @returns true if the the media query matches, false otherwise, or null in matchMedia is not supported.
 */
export const useMediaQuery = (query: string) => {
  const supportMatchMedia =
    typeof window !== 'undefined' && typeof window.matchMedia !== 'undefined';
    
  const [media, setMedia] = useState<boolean | null>(() => {
    if (supportMatchMedia)
      return window.matchMedia(query).matches;
    else 
      return null; // Fallback to desktop if media query is not supported
  });

  useEffect(() => {
    if (!supportMatchMedia) return;

    const updateMedia = (e: MediaQueryListEvent) => setMedia(e.matches);
    
    const media = window.matchMedia(query);
    media.addEventListener("change", updateMedia);

    return () => media.removeEventListener("change", updateMedia);
  }, [supportMatchMedia, query]);

  return media;
}
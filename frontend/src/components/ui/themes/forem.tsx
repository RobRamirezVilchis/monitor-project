import {
  mergeThemeOverrides,
} from "@mantine/core";

import defaultTheme from "./default";

/**
 * Forem theme.
 * 
 * Loading `styles/forem.css` is needed in order to use this theme.
 */
const foremTheme = mergeThemeOverrides(defaultTheme, {
  colors: {
    "forem-neutral": [
      "var(--forem-neutral-50)",
      "var(--forem-neutral-100)",
      "var(--forem-neutral-200)",
      "var(--forem-neutral-300)",
      "var(--forem-neutral-400)",
      "var(--forem-neutral-500)",
      "var(--forem-neutral-600)",
      "var(--forem-neutral-700)",
      "var(--forem-neutral-800)",
      "var(--forem-neutral-900)",
    ],
    "forem-green": [
      "var(--forem-green-50)",
      "var(--forem-green-100)",
      "var(--forem-green-200)",
      "var(--forem-green-300)",
      "var(--forem-green-400)",
      "var(--forem-green-500)",
      "var(--forem-green-600)",
      "var(--forem-green-700)",
      "var(--forem-green-800)",
      "var(--forem-green-900)",
    ],
    "forem-yellow": [
      "var(--forem-yellow-50)",
      "var(--forem-yellow-100)",
      "var(--forem-yellow-200)",
      "var(--forem-yellow-300)",
      "var(--forem-yellow-400)",
      "var(--forem-yellow-500)",
      "var(--forem-yellow-600)",
      "var(--forem-yellow-700)",
      "var(--forem-yellow-800)",
      "var(--forem-yellow-900)",
    ],
    "forem-blue": [
      "var(--forem-blue-50)",
      "var(--forem-blue-100)",
      "var(--forem-blue-200)",
      "var(--forem-blue-300)",
      "var(--forem-blue-400)",
      "var(--forem-blue-500)",
      "var(--forem-blue-600)",
      "var(--forem-blue-700)",
      "var(--forem-blue-800)",
      "var(--forem-blue-900)",
    ],
    "forem-red": [
      "var(--forem-red-50)",
      "var(--forem-red-100)",
      "var(--forem-red-200)",
      "var(--forem-red-300)",
      "var(--forem-red-400)",
      "var(--forem-red-500)",
      "var(--forem-red-600)",
      "var(--forem-red-700)",
      "var(--forem-red-800)",
      "var(--forem-red-900)",
    ],
  },
  primaryColor: "forem-green",
  primaryShade: 5,
});

export default foremTheme;

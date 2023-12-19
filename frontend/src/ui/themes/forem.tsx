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
  },
  primaryColor: "forem-green",
  primaryShade: 5,
});

export default foremTheme;

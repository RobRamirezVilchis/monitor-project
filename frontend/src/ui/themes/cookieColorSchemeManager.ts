import { 
  MantineColorScheme, 
  MantineColorSchemeManager, 
} from "@mantine/core";
import Cookies from "js-cookie";

export interface CookieColorSchemeManagerOptions {
  /**
   * Cookie name used to retrieve and store color scheme
   * @default color-scheme
   */
  name?: string;
}

const colorSchemeOptions: MantineColorScheme[] = ["auto", "light", "dark"];

export const colorSchemeCookieName = "color-scheme";

export function cookieColorSchemeManager(): MantineColorSchemeManager {
  let mediaQuery: MediaQueryList;
  let mediaQueryListener: (e: MediaQueryListEvent) => void;
  if (typeof window !== "undefined") {
    mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQueryListener = (e: MediaQueryListEvent) => {
      const colorScheme = e.matches ? "dark" : "light";
      document.documentElement.classList.remove(...colorSchemeOptions);
      document.documentElement.classList.add(colorScheme);
    };
  }

  return {
    get: (defaultValue) => {
      const colorScheme = Cookies.get(colorSchemeCookieName) as MantineColorScheme || "auto";
      if (colorScheme === "auto") {
        document.documentElement.classList.add(
          window.matchMedia("(prefers-color-scheme: dark)").matches 
            ? "dark" 
            : "light"
        );
      }
      return colorScheme;
    },
    set: (value) => {
      Cookies.set(colorSchemeCookieName, value, {
        path: "/",
        sameSite: "Lax",
      });
      document.documentElement.classList.remove(...colorSchemeOptions);
      if (value === "auto") {
        document.documentElement.classList.add(
          window.matchMedia("(prefers-color-scheme: dark)").matches 
            ? "dark" 
            : "light"
        );
      }
      else {
        document.documentElement.classList.add(value);
      }
    },
    subscribe: (onUpdate) => {
      mediaQuery?.addEventListener("change", mediaQueryListener);
    },
    unsubscribe: () => {
      mediaQuery?.removeEventListener("change", mediaQueryListener);
    },
    clear: () => {
      Cookies.remove(colorSchemeCookieName);
    },
  };
}

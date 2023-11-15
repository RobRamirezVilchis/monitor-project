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
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const mediaQueryListener = (e: MediaQueryListEvent) => {
    const colorSchema = e.matches ? "dark" : "light";
    document.documentElement.classList.remove(...colorSchemeOptions);
    document.documentElement.classList.add(colorSchema);
  };

  return {
    get: (defaultValue) => {
      const colorSchema = Cookies.get(colorSchemeCookieName) as MantineColorScheme || defaultValue;
      if (colorSchema === "auto") {
        document.documentElement.classList.add(
          window.matchMedia("(prefers-color-scheme: dark)").matches 
            ? "dark" 
            : "light"
        );
      }
      return colorSchema;
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
      mediaQuery.addEventListener("change", mediaQueryListener);
    },
    unsubscribe: () => {
      mediaQuery.removeEventListener("change", mediaQueryListener);
    },
    clear: () => {
      Cookies.remove(colorSchemeCookieName);
    },
  };
}

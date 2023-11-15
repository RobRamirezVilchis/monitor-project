import { 
  MantineColorScheme, 
  MantineColorSchemeManager, 
  isMantineColorScheme,
} from "@mantine/core";
import Cookies from "js-cookie";

export interface CookieColorSchemeManagerOptions {
  /**
   * Cookie name used to retrieve and store color scheme
   * @default color-scheme
   */
  name?: string;
}

const colorSchemeOptions: MantineColorScheme[] = ["dark", "light"];

export function cookieColorSchemeManager({
  name = "color-scheme",
}: CookieColorSchemeManagerOptions = {}): MantineColorSchemeManager {
  return {
    get: (defaultValue) => {
      return Cookies.get(name) as MantineColorScheme || defaultValue;
    },
    set: (value) => {
      Cookies.set(name, value, {
        path: "/",
        sameSite: "Lax",
      });
      document.documentElement.classList.remove(...colorSchemeOptions);
      document.documentElement.classList.add(value);
    },
    subscribe: (onUpdate) => {
      
    },
    unsubscribe: () => {
      
    },
    clear: () => {
      Cookies.remove(name);
    },
  };
}

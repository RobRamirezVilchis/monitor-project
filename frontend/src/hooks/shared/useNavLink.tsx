import { usePathname } from "next/navigation";
import { LinkProps } from "next/link";

type Url = LinkProps["href"];

export const useNavLink = (url: Url) => {
  const pathname = usePathname();
  if (typeof url === "string" && url == "/users") {
    return pathname == "/users";
  }

  return typeof url === "string"
    ? pathname.startsWith(url)
    : pathname === url.href;
};

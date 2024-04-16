import { usePathname } from "next/navigation";
import { LinkProps } from "next/link";

type Url = LinkProps["href"];

export const useNavLink = (url: Url) => {
  const pathname = usePathname();
  console.log(url, pathname);

  return typeof url === "string"
    ? pathname.startsWith(url)
    : pathname === url.href;
};

import { usePathname } from "next/navigation";
import { LinkProps } from "next/link";

type Url = LinkProps["href"];

export const useNavLink = (url: Url) => {
  const pathname = usePathname();

  return typeof url === "string" 
    ? pathname === url 
    : pathname === url.href;
}
import React from "react";
import { useRouter } from "next/router";
import Link, { LinkProps } from "next/link";

export interface NavLinkProps extends 
  Omit<LinkProps, "className">, 
  React.RefAttributes<HTMLAnchorElement>,
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>, 
  React.RefAttributes<HTMLAnchorElement>
{
  classes?: {
    root?: string;
    inactive?: string;
    active?: string;
  };
  children?: React.ReactNode;
}

export const NavLink: React.FC<NavLinkProps> = ({ classes, children, ...linkProps }) => {
  const router = useRouter();

  const isLinkActive = () => {
    return router.pathname === linkProps.href;
  };

  return (
    <Link
      {...linkProps}
      className={`${linkProps.className} ${classes?.root} ${
        isLinkActive() ? classes?.active : classes?.inactive
      }`}
    >
      {children}
    </Link>
  );
};
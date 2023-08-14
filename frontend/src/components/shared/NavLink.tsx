"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link, { LinkProps } from "next/link";
import classNames from "classnames";

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
  const pathname = usePathname();

  const isLinkActive = () => {
    if (!linkProps.href) return false;
    
    let href = "";
    if (typeof linkProps.href === "string") {
      href = linkProps.href;
    }
    else {
      if (!linkProps.href.href) return false;
      href = linkProps.href.href;
    }

    return pathname === href;
  };

  const active = isLinkActive();

  return (
    <Link
      {...linkProps}
      className={classNames(linkProps.className, classes?.root, {
        [`${classes?.active}`]: classes?.active && active,
        [`${classes?.inactive}`]: classes?.inactive && !active,
      })}
    >
      {children}
    </Link>
  );
};
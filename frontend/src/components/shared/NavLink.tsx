"use client";

import { AnchorHTMLAttributes, ReactNode, RefAttributes } from "react";
import clsx from "clsx";
import Link, { LinkProps } from "next/link";

import { useNavLink } from "@/hooks/shared";

export interface NavLinkProps extends 
  Omit<LinkProps, "className">, 
  RefAttributes<HTMLAnchorElement>,
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>, 
  RefAttributes<HTMLAnchorElement>
{
  classes?: {
    root?: string;
    inactive?: string;
    active?: string;
  };
  children?: ReactNode;
}

export const NavLink = ({
  classes, 
  children,
  ...linkProps
}: NavLinkProps) => {
  const active = useNavLink(linkProps.href);

  return (
    <Link
      {...linkProps}
      className={clsx(linkProps.className, classes?.root, {
        [`${classes?.active}`]: classes?.active && active,
        [`${classes?.inactive}`]: classes?.inactive && !active,
      })}
    >
      {children}
    </Link>
  );
};
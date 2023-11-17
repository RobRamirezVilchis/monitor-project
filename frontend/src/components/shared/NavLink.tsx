"use client";

import React from "react";
import Link, { LinkProps } from "next/link";
import clsx from "clsx";

import { useNavLink } from "@/hooks/shared";

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
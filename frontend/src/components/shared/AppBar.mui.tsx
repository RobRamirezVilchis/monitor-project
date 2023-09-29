"use client";

import { FC, Key, useRef, useState, MouseEvent } from "react";
import { usePathname } from "next/navigation";
import Badge from "@mui/material/Badge";
import ButtonBase from "@mui/material/ButtonBase";
import classNames from "classnames";
import IconButton from "@mui/material/IconButton";
import Link from "next/link";
import Menu from "@mui/material/Menu";
import MenuItem, { MenuItemProps } from "@mui/material/MenuItem";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";

import { NavLink } from "@/components/shared";
import { Role } from "@/api/auth.types";
import { isUserInAuthorizedRoles } from "@/api/auth";
import { ProfileFloatingMenu } from "./ProfileFloatingMenu";
import { useAuth } from "@/hooks/auth";

import MenuIcon from "@mui/icons-material/Menu";

export interface NavMenuItem {
  id: Key,
  label: string,
  href?: string,
  rolesWhitelist?: Role[];
  rolesBlacklist?: Role[];
  badgeCount?: number;
}

export interface AppBarProps extends MuiAppBarProps  {
  navMenuItems?: NavMenuItem[]
}

export const AppBar: FC<AppBarProps> = ({
  navMenuItems, children, 
  ...appBarProps
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const barRef = useRef<null | HTMLDivElement>(null);
  const { user } = useAuth({
    skipAll: true,
  });

  const renderNavMenuItems = navMenuItems ? navMenuItems.filter(
    item => isUserInAuthorizedRoles(user, item.rolesWhitelist, item.rolesBlacklist)
  ) : [];

  const onMenuButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(barRef.current);
  };

  const onMenuClose = () => {
    setMenuAnchorEl(null);
  };

  return (
    <MuiAppBar
      {...appBarProps}
      className={classNames("!bg-neutral-800", appBarProps.className)}
    >
      <div className="py-0.5" ref={barRef}>
        <div className="hidden md:flex items-center px-3 py-2">
          <Link href="/">
            <span className="h-7">Logo</span>
          </Link>

          <div className="flex flex-1 mx-4 items-center">
            {renderNavMenuItems.map((item) => (
              <ButtonBase
                key={item.id}
                component="div"
              >
                <NavLink
                  href={item.href || "#"}
                  className="text-center"
                  classes={{
                    root: "hover:text-blue-400 px-2 py-2.5 min-w-24",
                    active: "shadow-[inset_0_-3px] shadow-blue-400 text-blue-400",
                  }}
                >
                  <Badge
                    badgeContent={item.badgeCount}
                    color="error"
                    max={99}
                    className="inline-block pt-1"
                  >
                    {item.label}
                  </Badge>
                </NavLink>
              </ButtonBase>
            ))}
          </div>

          <ProfileFloatingMenu />
        </div>

        <div className="md:hidden flex items-center px-1 py-0.5">
          <IconButton color="inherit" onClick={onMenuButtonClick}>
            <Badge
              color="error"
              variant="dot"
              invisible={
                renderNavMenuItems.findIndex(
                  (x) => x.badgeCount && x.badgeCount > 0
                ) === -1
              }
            >
              <MenuIcon />
            </Badge>
          </IconButton>

          <div className="flex-1 flex justify-center">
            <Link href="/">
              <span className="h-6">Logo</span>
            </Link>
          </div>

          <ProfileFloatingMenu />

          <Menu
            anchorEl={menuAnchorEl}
            open={!!menuAnchorEl}
            onClose={onMenuClose}
            classes={{ paper: "w-full", root: "md:hidden w-full" }}
          >
            {renderNavMenuItems.map((item) => (
              <MenuItemLink
                key={item.id}
                onClick={onMenuClose}
                href={item.href}
              >
                <Badge
                  badgeContent={item.badgeCount}
                  color="error"
                  max={99}
                  className="inline-block px-4"
                >
                  {item.label}
                </Badge>
              </MenuItemLink>
            ))}
          </Menu>
        </div>

        {children ? <div>{children}</div> : null}
      </div>
    </MuiAppBar>
  );
}

interface MenuItemLinkProps extends MenuItemProps {
  href?: string;
  linkClassName?: string;
}

const MenuItemLink: React.FC<MenuItemLinkProps> = ({ 
  href, linkClassName, children, ...menuProps 
}) => {
  const pathname = usePathname();
  
  const isLinkActive = () => {
    return href && pathname === href;
  };

  const active = isLinkActive();
  
  const labelClasses = "flex items-center justify-center w-full h-full";

  return (
    <MenuItem {...menuProps} 
      className={classNames(
        "px-0 py-3 min-h-[1.5rem] hover:text-blue-600", 
        menuProps.className, {
          "!bg-blue-50 text-blue-600": active,
        }
      )}
    >
    {href ? (
      <Link href={href} className={labelClasses}>
        {children}
      </Link>
    ) : <span className={classNames(labelClasses, linkClassName)}>{children}</span>}
    </MenuItem>
  );
};

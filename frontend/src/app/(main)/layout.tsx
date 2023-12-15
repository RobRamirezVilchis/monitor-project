"use client";

import { ReactNode, useMemo, useState } from "react";
import { 
  AppShell, 
  Burger, 
  Indicator, 
  NavLink, type NavLinkProps, 
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import clsx from "clsx";
import Link from "next/link";

import { ProfileFloatingMenu } from "@/components/shared";
import { Role } from "@/api/services/auth/types";
import { useNavLink } from "@/hooks/shared";
import { isUserInAuthorizedRoles } from "@/api/services/auth";
import { useAuth } from "@/hooks/auth";
import { withAuth } from "@/components/auth/withAuth";

interface NavMenuItem {
  label: string,
  href?: string,
  rolesWhitelist?: Role[];
  rolesBlacklist?: Role[];
  badgeCount?: number;
}

interface MainLayoutProps {
  children?: ReactNode;
}

const MainLayout = ({ 
  children 
}: MainLayoutProps) => { 
  const [isOpen, { toggle, close }] = useDisclosure(false);
  const { user } = useAuth();

  const [links, setLinks] = useState<NavMenuItem[]>([
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Users",
      href: "/users",
    },
  ]);
  const visibleLinks = useMemo(
    () => links.filter(link => isUserInAuthorizedRoles(user, link.rolesWhitelist, link.rolesBlacklist)), 
    [links, user]
  );


  return (
    <AppShell
      header={{ 
        height: { base: 50, sm: 60 },
      }}
      navbar={{ 
        width: 300, 
        breakpoint: "sm", 
        collapsed: { 
          desktop: true, 
          mobile: !isOpen 
        },
      }}
      classNames={{
        root: "h-full",
        header: "flex items-center gap-1 px-3 py-2",
        main: "h-full min-h-full",
        navbar: "border-none",
      }}
    >
      <AppShell.Header>
        <Burger opened={isOpen} onClick={toggle} hiddenFrom="sm" size="sm" />

        {/* Desktop */}
        <div className="flex-1 hidden md:flex justify-between items-center gap-1">
          <Link href="/">
            <span className="h-7">Logo</span>
          </Link>
          <div className="flex gap-2 items-center mx-4">
            {visibleLinks.map((item) => <DesktopNavLink key={item.href} item={item} />)}
          </div>
        </div>

        {/* Mobile */}
        <div className="flex-1 flex md:hidden justify-center">
          <Link href="/">
            <span className="h-6">Logo</span>
          </Link>
        </div>

        <ProfileFloatingMenu />
      </AppShell.Header>

      <AppShell.Navbar 
        classNames={{ navbar: "px-2.5 py-2.5" }}
      >
        {visibleLinks.map((item) => <MobileNavLink key={item.href} item={item} onClick={close} />)}
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}

export default withAuth(MainLayout);

interface DesktopNavLinkProps {
  item: NavMenuItem;
  onClick?: NavLinkProps["onClick"];
}

const DesktopNavLink = ({
  item,
  onClick,
}: DesktopNavLinkProps) => {
  const theme = useMantineTheme();
  const active = useNavLink(item.href || "#");
  const primaryColor = theme.variantColorResolver({
    color: theme.primaryColor,
    theme: theme,
    variant: "filled"
  });

  return (
    <NavLink
      component={Link}
      href={item.href || "#"}
      onClick={onClick}
      className="text-center"
      classNames={{
        root: clsx("px-2 py-2.5 min-w-24", {
        }),
        body: "overflow-visible",
      }}
      styles={{
        root: {
          boxShadow: active 
            ? `inset 0 -3px ${primaryColor.background}` 
            : undefined,
          color:  active ? primaryColor.background : undefined,
        }
      }}
      label={
        <Indicator
          disabled={!item.badgeCount}
          label={
            typeof item.badgeCount === "number" && item.badgeCount > 99
            ? "99+" 
            : item.badgeCount
          }
          color="red"
          classNames={{
            indicator: "py-2",
          }}
        >
          {item.label}
        </Indicator>
      }
    />

  );
}

interface MobileNavLinkProps {
  item: NavMenuItem;
  onClick?: NavLinkProps["onClick"];
}

const MobileNavLink = ({
  item,
  onClick,
}: MobileNavLinkProps) => {
  const active = useNavLink(item.href || "#");

  return (
    <NavLink
      component={Link}
      href={item.href || "#"}
      onClick={onClick}
      className="text-center"
      classNames={{
        root: "px-2 py-2.5 min-w-24",
        body: "overflow-visible",
        label: "flex justify-center",
      }}
      active={active}
      label={
        <Indicator
          disabled={!item.badgeCount}
          label={
            typeof item.badgeCount === "number" && item.badgeCount > 99 
            ? "99+" 
            : item.badgeCount
          }
          color="red"
          classNames={{
            indicator: "py-2",
          }}
        >
          {item.label}
        </Indicator>
      }
    />
  );
}
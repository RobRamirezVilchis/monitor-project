"use client";

import { ReactNode, useMemo, useState } from "react";
import {
  AppShell,
  Burger,
  Indicator,
  NavLink,
  type NavLinkProps,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import clsx from "clsx";
import Link from "next/link";
import Image from "next/image";

import { ProfileFloatingMenu } from "@/components/shared";
import { Role } from "@/api/services/auth/types";
import { useNavLink } from "@/hooks/shared";
import { isUserInAuthorizedRoles } from "@/api/services/auth";
import { useAuth } from "@/hooks/auth";
import { withAuth } from "@/components/auth/withAuth";
import BrandForem from "@/ui/icons/BrandForem";
import Introid from "../../media/introid_bw.png";

interface NavMenuItem {
  label: string;
  href?: string;
  rolesWhitelist?: Role[];
  rolesBlacklist?: Role[];
  badgeCount?: number;
}

interface MainLayoutProps {
  children?: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [isOpen, { toggle, close }] = useDisclosure(false);

  const [links, setLinks] = useState<NavMenuItem[]>([
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Driving",
      href: "/monitor/safedriving",
    },
    {
      label: "Industry",
      href: "/monitor/industry",
    },
  ]);

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
          mobile: !isOpen,
        },
      }}
      classNames={{
        root: "h-full",
        header:
          "flex items-center gap-1 px-3 py-2 bg-dark-900 text-neutral-300 border-none",
        main: "h-full min-h-full",
        navbar: "border-none",
      }}
    >
      <AppShell.Header>
        <Burger opened={isOpen} onClick={toggle} hiddenFrom="sm" size="sm" />

        {/* Desktop */}
        <div className="flex-1 hidden md:flex justify-between items-center gap-1">
          <Link className="flex items-center" href="/monitor/safedriving">
            <Image
              className="pr-1 border-r border-neutral-600"
              src={Introid}
              width={120}
              height={32}
              alt="Picture of the author"
            ></Image>
            <span className="ml-2 mt-1">Monitor</span>
          </Link>
        </div>

        {/* Mobile */}
        <div className="flex-1 flex md:hidden justify-center">
          <Link href="/">
            <span className="h-6">Monitor</span>
          </Link>
        </div>

        <ProfileFloatingMenu />
      </AppShell.Header>

      <AppShell.Navbar
        classNames={{ navbar: "px-2.5 py-2.5" }}
      ></AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};

export default MainLayout;

interface DesktopNavLinkProps {
  item: NavMenuItem;
  onClick?: NavLinkProps["onClick"];
}

const DesktopNavLink = ({ item, onClick }: DesktopNavLinkProps) => {
  const theme = useMantineTheme();
  const active = useNavLink(item.href || "#");
  const primaryColor = theme.variantColorResolver({
    color: theme.primaryColor,
    theme: theme,
    variant: "filled",
  });

  return (
    <NavLink
      component={Link}
      href={item.href || "#"}
      onClick={onClick}
      className="text-center"
      classNames={{
        root: clsx("px-2 py-2.5 min-w-24", {}),
        body: "overflow-visible",
      }}
      styles={{
        root: {
          boxShadow: active
            ? `inset 0 -3px ${primaryColor.background}`
            : undefined,
          color: active ? primaryColor.background : undefined,
        },
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
};

interface MobileNavLinkProps {
  item: NavMenuItem;
  onClick?: NavLinkProps["onClick"];
}

const MobileNavLink = ({ item, onClick }: MobileNavLinkProps) => {
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
};

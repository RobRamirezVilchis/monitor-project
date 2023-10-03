"use client";

import { FC, Key, ReactNode } from "react";
import { AppShell, Burger, Indicator } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";

import { NavLink, ProfileFloatingMenu } from "@/components/shared";
import { Role } from "@/api/auth.types";
import { withAuth } from "@/components/auth/withAuth";

export interface NavMenuItem {
  id: Key,
  label: string,
  href?: string,
  rolesWhitelist?: Role[];
  rolesBlacklist?: Role[];
  badgeCount?: number;
}

interface MainLayoutProps {
  children?: ReactNode;
}

const links: NavMenuItem[] = [
  {
    id: 1,
    label: "Home",
    href: "/",
    badgeCount: 1000,
  },
  {
    id: 2,
    label: "Blog",
    href: "/blog",
    badgeCount: 20,
  },
];

const MainLayout: FC<MainLayoutProps> = ({ children }) => { 
  const [isOpen, { toggle, close }] = useDisclosure(false);

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
        header: "bg-neutral-800 text-white flex items-center gap-1 px-3 py-2",
        main: "h-full min-h-full",
      }}
    >
      <AppShell.Header>
        <Burger color="white" opened={isOpen} onClick={toggle} hiddenFrom="sm" size="sm" />
        <div className="flex-1 hidden md:flex justify-between items-center gap-1">
          <Link href="/">
            <span className="h-7">Logo</span>
          </Link>
          <div className="flex gap-2 items-center mx-4">
            {links.map((item) => (
              <NavLink
                key={item.id}
                href={item.href || "#"}
                className="text-center"
                classes={{
                  root: "hover:text-blue-400 px-2 py-2.5 min-w-24",
                  active: "shadow-[inset_0_-3px] shadow-blue-400 text-blue-400",
                }}
              >
                <Indicator
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
              </NavLink>
            ))}
          </div>
        </div>

        <div className="flex-1 flex md:hidden justify-center">
          <Link href="/">
            <span className="h-6">Logo</span>
          </Link>
        </div>

        <ProfileFloatingMenu />
      </AppShell.Header>

      <AppShell.Navbar py="md" px={4}>
        {links.map((item) => (
          <NavLink
            key={item.id}
            href={item.href || "#"}
            className="text-center"
            classes={{
              root: "hover:text-blue-600 px-2 py-2.5 flex justify-center items-center",
              active: "bg-blue-50 text-blue-600",
            }}
            onClick={close}
          >
            <Indicator
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
          </NavLink>
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}

export default withAuth<any>(MainLayout);

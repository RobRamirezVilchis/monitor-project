"use client";

import {
  AppShell,
  Burger,
  HoverCard,
  Indicator,
  NavLink,
  useMantineTheme,
  type NavLinkProps,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { ReactNode, useMemo, useState } from "react";

import { Role } from "@/api/services/auth/types";
import {
  ColorSchemeButtonToggle,
  ColorSchemeSelectToggle,
  ColorSchemeSwitchToggle,
  ProfileFloatingMenu,
} from "@/components/shared";
import { useNavLink } from "@/hooks/shared";
import Introid from "../../media/introid_bw.png";
import fonts from "@/ui/fonts";
import { string } from "zod";

interface NavMenuItem {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
  rolesWhitelist?: Role[];
  rolesBlacklist?: Role[];
  badgeCount?: number;
}

interface MainLayoutProps {
  children?: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [isOpen, { toggle, close }] = useDisclosure(false);

  const serverLink = {
    label: "Servicios",
    href: "/monitor/services",
  };

  const [links, setLinks] = useState<NavMenuItem[]>([
    {
      label: "Safe Driving",
      children: [
        { label: "Safe Driving", href: "/monitor/safe-driving" },
        { label: "Romberg", href: "/monitor/safe-driving/romberg/" },
      ],
    },
    {
      label: "Industry",
      href: "/monitor/industry",
    },
    {
      label: "Smart Retail",
      href: "/monitor/smart-retail",
    },
    {
      label: "Buildings",
      href: "/monitor/smart-buildings",
    },
  ]);

  const visibleLinks = useMemo(() => links, [links]);

  return (
    <AppShell
      header={{
        height: { base: 50, sm: 60 },
      }}
      navbar={{
        width: 300,
        breakpoint: "lg",
        collapsed: {
          desktop: true,
          mobile: !isOpen,
        },
      }}
      classNames={{
        root: "h-full",
        header:
          "flex items-center gap-1 px-3 py-2 bg-dark-600 text-neutral-300 border-none",
        main: "h-full min-h-full",
        navbar: "border-none",
      }}
    >
      <AppShell.Header>
        <Burger
          classNames={{ root: "bg-gray-500 rounded-md" }}
          opened={isOpen}
          onClick={toggle}
          hiddenFrom="md"
          size="sm"
        />

        {/* Desktop */}
        <div className="flex-1 hidden lg:flex justify-between items-center gap-1">
          <Link className="flex items-center" href="/monitor/safe-driving">
            <Image
              className="pr-1 border-r border-neutral-600"
              src={Introid}
              width={120}
              height={32}
              alt="Picture of the author"
            ></Image>
            <p
              className={clsx(
                fonts.ubuntu.className,
                "ml-3 h-6 mb-1 text-lg text-white font-medium tracking-wider"
              )}
            >
              MONITOR
            </p>
          </Link>
          <div className="flex items-center">
            <div className="mr-8 pt-1">
              <ColorSchemeButtonToggle />
            </div>
            <DesktopNavLink item={serverLink} />
            <div className="border-l ml-4 h-6 border-neutral-600" />
            <div className="flex gap-2 items-center mx-4">
              {visibleLinks.map((item) => (
                <>
                  {item.href ? (
                    <DesktopNavLink key={item.href} item={item} />
                  ) : (
                    <DropdownNavLink key={item.href} item={item} />
                  )}
                </>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className="flex-1 flex lg:hidden justify-between">
          <div></div>
          <Link href="/">
            <span
              className={clsx(
                fonts.ubuntu.className,
                "ml-4 h-6 text-lg font-bold"
              )}
            >
              Monitor
            </span>
          </Link>

          <ColorSchemeButtonToggle />
        </div>

        <ProfileFloatingMenu />
      </AppShell.Header>

      <AppShell.Navbar>
        <div className="mx-8">
          <div className="flex flex-col mt-4 gap-2 lg:hidden">
            {visibleLinks.map((item) => (
              <MobileNavLink key={item.href} item={item} onClick={toggle} />
            ))}
          </div>
          <div className="border-b my-4 border-neutral-300" />
          <div className="flex items-center">
            <MobileNavLink item={serverLink} onClick={toggle} />
          </div>
        </div>
      </AppShell.Navbar>

      <AppShell.Main>
        <div>{children}</div>
      </AppShell.Main>
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
    <div className={`${active ? "border-t-4 border-green-600" : ""}`}>
      <NavLink
        component={Link}
        href={item.href || "#"}
        onClick={onClick}
        className="text-center"
        classNames={{
          root: clsx(
            "px-2 py-2.5 w-24 hover:bg-dark-400 transition-colors duration-200 rounded-lg",
            {}
          ),
          body: `overflow-visible ${
            active ? "text-green-600" : "text-gray-300"
          }`,
        }}
        styles={
          {
            /* root: {
            boxShadow: active
              ? `inset 0 -3px ${primaryColor.background}`
              : undefined,
            color: active ? primaryColor.background : undefined,
          }, */
          }
        }
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
    </div>
  );
};

const DropdownNavLink = ({ item, onClick }: DesktopNavLinkProps) => {
  const theme = useMantineTheme();
  const active = useNavLink(item.href || "#");
  const primaryColor = theme.variantColorResolver({
    color: theme.primaryColor,
    theme: theme,
    variant: "filled",
  });

  return (
    <HoverCard>
      <HoverCard.Target>
        <div className="cursor-default  text-sm px-2 py-2.5 w-24 hover:bg-dark-400 transition-colors duration-200 rounded-lg">
          {item.label}
        </div>
      </HoverCard.Target>
      <HoverCard.Dropdown className="bg-dark-400 border-none">
        {item.children?.map((child, i) => (
          <div
            key={i}
            className={`${active ? "border-t-4 border-green-600" : ""}`}
          >
            <NavLink
              component={Link}
              href={child.href || "#"}
              onClick={onClick}
              className="text-center"
              classNames={{
                root: clsx(
                  "px-2 py-2.5 w-24 hover:bg-dark-600 transition-colors duration-200 rounded-lg",
                  {}
                ),
                body: `overflow-visible ${
                  active ? "text-green-600" : "text-gray-300"
                }`,
              }}
              styles={
                {
                  /* root: {
            boxShadow: active
              ? `inset 0 -3px ${primaryColor.background}`
              : undefined,
            color: active ? primaryColor.background : undefined,
          }, */
                }
              }
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
                  {child.label}
                </Indicator>
              }
            />
          </div>
        ))}
      </HoverCard.Dropdown>
    </HoverCard>
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
        label: "flex text-xl",
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

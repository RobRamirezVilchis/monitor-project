"use client";

import { Fragment, ReactNode, useMemo } from "react";
import { 
  ActionIcon, 
  Button,
  Loader, 
  Divider,
  Paper, 
  Popover, 
  Tooltip,
  NavLink,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";

import { ColorSchemeSwitchToggle } from "../shared";
import { isUserInAuthorizedRoles } from "@/api/services/auth";
import { randomColor } from "@/utils/color";
import { Role } from "@/api/services/auth/types";
import { useAuth } from "@/hooks/auth";
import { useImmer } from "use-immer";
import { useNavLink } from "@/hooks/shared";
import { UserAvatar } from "./UserAvatar";

import { IconLogin, IconLogout, IconShieldLock, IconUser, IconUsers } from "@tabler/icons-react";

interface NavMenuItem {
  label: string,
  href?: string,
  icon?: ReactNode,
  rolesWhitelist?: Role[];
  rolesBlacklist?: Role[];
}

export const ProfileFloatingMenu = () => {
  const { user, isAuthenticated, loading, logout } = useAuth({
    redirectIfNotAuthenticated: false,
    redirectIfNotAuthorized: false,
  });
  const [open, { toggle, close }] = useDisclosure(false);
  const fallbackAvatarColor = useMemo(
    () => !user?.extra?.picture ? randomColor() : "#000",
    [user?.extra?.picture]  
  );
  
  const [links, setLinks] = useImmer<NavMenuItem[]>([
    {
      label: "Mi usuario",
      href: "/users/me",
      icon: <IconUser className="w-4 h-4" />,
    },
    {
      label: "Usuarios",
      href: "/users",
      icon: <IconUsers className="w-4 h-4" />,
      rolesWhitelist: ["Admin"],
    },
    {
      label: "Whitelist",
      href: "/users/whitelist",
      icon: <IconShieldLock className="w-4 h-4" />,
      rolesWhitelist: ["Admin"],
    },
    {
      label: "Acceso de usuarios",
      href: "/users/access",
      icon: <IconLogin className="w-4 h-4" />,
      rolesWhitelist: ["Admin"],
    },
  ]);
  const visibleLinks = useMemo(
    () => links.filter(link => isUserInAuthorizedRoles(user, link.rolesWhitelist, link.rolesBlacklist)), 
    [links, user]
  );

  const onLogout = () => {
    close();
    logout();
  };

  return (
    <Popover
      opened={open}
      onChange={toggle}
      shadow="md"
    >
      <Popover.Target>
        <Tooltip label="Yo">
          <ActionIcon
            onClick={toggle}
            radius="xl"
            variant="transparent"
          >
            <UserAvatar user={user} fallbackColor={fallbackAvatarColor} solidColor />
          </ActionIcon>
        </Tooltip>
      </Popover.Target>

      <Popover.Dropdown>
        <div className="px-6 py-2 flex flex-col gap-3">
          {isAuthenticated && !loading ? (
            <>
              <div className="flex flex-col gap-3 justify-center items-center">
                <UserAvatar user={user} fallbackColor={fallbackAvatarColor} solidColor />
                <div className="flex flex-col gap-1 justify-center items-center">
                  <span className="text-base font-semibold">
                    {user?.first_name} {user?.last_name}
                  </span>
                  <span className="text-sm">{user?.email}</span>
                </div>
              </div>

              <div className="flex justify-center">
                <ColorSchemeSwitchToggle />
              </div>

              <Paper 
                withBorder
                className="flex flex-col rounded-lg overflow-hidden"
              >
                {visibleLinks.map((item, idx) => (
                  <Fragment key={item.href ?? item.label}>
                    <ListLink
                      href={item.href ?? "#"}
                      label={item.label}
                      icon={item.icon}
                      onClick={close}
                    />
                    {idx < visibleLinks.length - 1 ? <Divider /> : null}
                  </Fragment>
                ))}
              </Paper>

              <Divider />

              <div
                className="flex justify-center items-center w-full"
              >
                <Button
                  leftSection={<IconLogout />}
                  onClick={onLogout}
                  variant="transparent"
                >
                  Cerrar sesión
                </Button>
              </div>
            </>
          ) : (
            <Loader />
          )}
        </div>
      </Popover.Dropdown>
    </Popover>
  );
}

interface ListLinkProps {
  href: string;
  icon?: ReactNode;
  label: string;
  onClick?: () => void;
}

const ListLink = ({ 
  href, 
  icon, 
  label, 
  onClick 
}: ListLinkProps) => {
  const active = useNavLink(href);

  return (
    <NavLink
      variant="light"
      component={Link}
      href={href}
      onClick={onClick}
      active={active}
      leftSection={icon}
      label={label}
    />
  );
};

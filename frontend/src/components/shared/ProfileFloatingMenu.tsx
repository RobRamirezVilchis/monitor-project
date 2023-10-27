import { ComponentType, FC, MouseEvent, useMemo, useState } from "react";
import { NavLink } from "../shared";
import { useQueryClient } from "@tanstack/react-query";
import { 
  UnstyledButton, 
  ActionIcon, 
  Button,
  Loader, 
  Divider, 
  Popover, 
  Tooltip 
} from "@mantine/core";

import { randomColor } from "@/utils/color";
import { useAuth } from "@/hooks/auth";
import { UserAvatar } from "./UserAvatar";

import { IconLogin, IconLogout, IconUsers } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";

export const ProfileFloatingMenu = () => {
  const { user, isAuthenticated, loading, logout } = useAuth({
    redirectIfNotAuthenticated: false,
    redirectIfNotAuthorized: false,
  });
  const [open, { toggle, close }] = useDisclosure(false);
  const queryClient = useQueryClient();
  const fallbackAvatarColor = useMemo(
    () => !user?.extra?.picture ? randomColor() : "#000",
    [user?.extra?.picture]  
  );

  const onLogout = () => {
    close();
    queryClient.invalidateQueries();
    logout();
  };

  const isAdmin = user?.roles?.includes("Admin");

  return (
    <Popover
      opened={open}
      onChange={toggle}
      classNames={{
        dropdown: "bg-neutral-800 text-white border-neutral-600"
      }}
      shadow="md"
    >
      <Popover.Target>
        <Tooltip label="Yo">
          <ActionIcon
            onClick={toggle}
          >
            <UserAvatar user={user} fallbackColor={fallbackAvatarColor} />
          </ActionIcon>
        </Tooltip>
      </Popover.Target>

      <Popover.Dropdown>
        <div className="px-6 py-2 flex flex-col gap-3">
          {isAuthenticated && !loading ? (
            <>
              <div className="flex flex-col gap-3 justify-center items-center">
                <UserAvatar user={user} fallbackColor={fallbackAvatarColor} />
                <div className="flex flex-col gap-1 justify-center items-center">
                  <span className="text-base font-semibold">
                    {user?.first_name} {user?.last_name}
                  </span>
                  <span className="text-sm">{user?.email}</span>
                </div>
              </div>

              {isAdmin ? (
                <div className="flex flex-col !bg-neutral-600 rounded-lg overflow-hidden">
                  <ListLink
                    href="/users"
                    Icon={IconUsers}
                    label="Usuarios"
                    onClick={close}
                  />
                  <ListLink
                    href="/users/access"
                    Icon={IconLogin}
                    label="Acceso de usuarios"
                    onClick={close}
                  />
                </div>
              ) : null}

              <Divider className="border-neutral-200" />

              <div
                className="flex justify-center items-center w-full"
              >
                <Button
                  color="white"
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
  Icon?: ComponentType<any>;
  label: string;
  onClick?: () => void;
}

const ListLink: FC<ListLinkProps> = ({ href, Icon, label, onClick }) => (
  <UnstyledButton component="div" className="w-full">
    <NavLink
      href={href}
      classes={{
        root: "text-sm w-full grid grid-cols-[auto,1fr] gap-4 items-center px-8 py-2 hover:bg-neutral-700",
        active: "bg-neutral-500",
      }}
      onClick={onClick}
    >
      {Icon ? <Icon className="w-4 h-4" /> : null}
      <span>{label}</span>
    </NavLink>
  </UnstyledButton>
);
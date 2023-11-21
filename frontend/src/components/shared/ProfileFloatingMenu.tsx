import { ReactNode, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { randomColor } from "@/utils/color";
import { useAuth } from "@/hooks/auth";
import { UserAvatar } from "./UserAvatar";

import { IconLogin, IconLogout, IconUsers } from "@tabler/icons-react";
import { useNavLink } from "@/hooks/shared";

export const ProfileFloatingMenu = () => {
  const { user, isAuthenticated, loading, logout } = useAuth({
    redirectIfNotAuthenticated: false,
    redirectIfNotAuthorized: false,
  });
  const [open, { toggle, close }] = useDisclosure(false);
  // const fallbackAvatarColor = useMemo(
  //   () => !user?.extra?.picture ? randomColor() : "#000",
  //   [user?.extra?.picture]  
  // );

  const onLogout = () => {
    close();
    logout();
  };

  const isAdmin = user?.roles?.includes("Admin");

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
          >
            <UserAvatar user={user} fallbackColor={"#fff"/*fallbackAvatarColor*/} />
          </ActionIcon>
        </Tooltip>
      </Popover.Target>

      <Popover.Dropdown>
        <div className="px-6 py-2 flex flex-col gap-3">
          {isAuthenticated && !loading ? (
            <>
              <div className="flex flex-col gap-3 justify-center items-center">
                <UserAvatar user={user} fallbackColor={"#fff"/*fallbackAvatarColor*/} />
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

              {isAdmin ? (
                <Paper 
                  withBorder
                  className="flex flex-col rounded-lg overflow-hidden"
                >
                  <ListLink
                    href="/users"
                    label="Usuarios"
                    icon={<IconUsers className="w-4 h-4" />}
                    onClick={close}
                  />
                  <Divider />
                  <ListLink
                    href="/users/access"
                    label="Acceso de usuarios"
                    icon={<IconLogin className="w-4 h-4" />}
                    onClick={close}
                  />
                </Paper>
              ) : null}

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

import { ComponentType, FC, MouseEvent, useMemo, useState } from "react";
import { NavLink } from "../../shared";
import { useQueryClient } from "@tanstack/react-query";
import ButtonBase from "@mui/material/ButtonBase";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MuiButton from "@mui/material/Button";
import Popover from "@mui/material/Popover";
import Tooltip from "@mui/material/Tooltip";

import { useAuth } from "@/hooks/auth";
import { UserAvatar } from "../UserAvatar";

import LogoutIcon from '@mui/icons-material/Logout';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import { randomColor } from "@/utils/color";

export const ProfileFloatingMenu = () => {
  const { user, isAuthenticated, loading, logout } = useAuth({
    redirectIfNotAuthenticated: false,
    redirectIfNotAuthorized: false,
  });
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);
  const queryClient = useQueryClient();
  const fallbackAvatarBackground = useMemo(
    () => !user?.extra?.picture ? randomColor() : "#000",
    [user?.extra?.picture]  
  )

  const onUserMenuButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    setUserMenuAnchorEl(e.currentTarget);
  };

  const onUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const onLogout = () => {
    queryClient.invalidateQueries();
    logout();
    onUserMenuClose();
  }

  const isAdmin = user?.roles?.includes("Admin");

  return (<>
    <Tooltip title="Yo" disableInteractive>
      <IconButton className="!p-0" onClick={onUserMenuButtonClick}>
        <UserAvatar user={user} fallbackColor={fallbackAvatarBackground} />
      </IconButton>
    </Tooltip>

    <Popover
      anchorEl={userMenuAnchorEl}
      open={!!userMenuAnchorEl}
      onClose={onUserMenuClose}
      classes={{ paper: "!bg-neutral-800 !text-white !min-w-[300px]" }}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      <div className="px-6 py-2 flex flex-col gap-3">
        {isAuthenticated && !loading ? (
          <>
            <div className="flex flex-col gap-3 justify-center items-center">
              <UserAvatar user={user} fallbackColor={fallbackAvatarBackground} />
              <div className="flex flex-col gap-1 justify-center items-center">
                <span className="text-base font-semibold">
                  {user?.first_name} {user?.last_name}
                </span>
                <span className="text-xs">{user?.email}</span>
              </div>
            </div>

            {isAdmin ? (
              <div className="flex flex-col !bg-neutral-600 rounded-lg overflow-hidden">
                <ListLink
                  href="/users"
                  Icon={PeopleAltIcon}
                  label="Usuarios"
                  onClick={onUserMenuClose}
                />
                <ListLink
                  href="/users/access"
                  Icon={MeetingRoomOutlinedIcon}
                  label="Acceso de usuarios"
                  onClick={onUserMenuClose}
                />
              </div>
            ) : null}

            <Divider flexItem className="border-neutral-200" />

            <MuiButton
              onClick={onLogout}
              startIcon={<LogoutIcon />}
              color="inherit"
              size="small"
              style={{ textTransform: "none" }}
            >
              Cerrar sesión
            </MuiButton>
          </>
        ) : (
          <CircularProgress />
        )}
      </div>
    </Popover>
  </>);
}

interface ListLinkProps {
  href: string;
  Icon?: ComponentType<any>;
  label: string;
  onClick?: () => void;
}

const ListLink: FC<ListLinkProps> = ({ href, Icon, label, onClick }) => (
  <ButtonBase component="div" className="w-full">
    <NavLink
      href={href}
      classes={{
        root: "w-full grid grid-cols-[auto,1fr] gap-4 items-center px-4 py-2 hover:!bg-neutral-700",
        active: "!bg-neutral-500",
      }}
      onClick={onClick}
    >
      {Icon ? <Icon className="!w-5 !h-5" /> : null}
      <span className="text-sm">{label}</span>
    </NavLink>
  </ButtonBase>
);
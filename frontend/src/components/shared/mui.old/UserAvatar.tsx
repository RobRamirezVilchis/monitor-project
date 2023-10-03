import Avatar, { AvatarProps } from "@mui/material/Avatar";
import { FC, useMemo } from "react";

import { User } from "@/api/auth.types";
import { randomColor, colorContrast } from "@/utils/color";

export interface UserAvatarProps extends AvatarProps {
  user: User | null;
  fallbackBgColor?: string;
}

export const UserAvatar: FC<UserAvatarProps> = ({ user, fallbackBgColor, ...avatarProps }) => {
  const backgroundColor = useMemo(
    () => !user?.extra?.picture ? (fallbackBgColor || randomColor()) : "#000", 
    [user?.extra?.picture, fallbackBgColor]
  );
  const color = useMemo(
    () => !user?.extra?.picture ? colorContrast(backgroundColor) : "#000", 
    [user?.extra?.picture, backgroundColor]
  );

  return (
    <Avatar
      {...avatarProps}
      src={user?.extra?.picture}
      imgProps={{
        referrerPolicy: "no-referrer",
        className: "w-full h-full object-cover",
      }}
      alt={`${user?.first_name} ${user?.last_name}`}
      sx={user?.extra?.picture ? {} : { 
        backgroundColor,
        color,
      }}
    >
      {
        user 
        ? `${user?.first_name[0]?.toUpperCase()}${user?.last_name[0]?.toUpperCase()}` 
        : "NA"
      }
    </Avatar>
  );
};

"use client";

import { Avatar, AvatarProps } from "@mantine/core";
import { useMemo } from "react";

import { User } from "@/api/services/auth/types";
import { randomColor, colorContrast } from "@/utils/color";

export interface UserAvatarProps extends AvatarProps {
  user: User | null;
  fallbackColor?: string;
  solidColor?: boolean;
}

export const UserAvatar = ({
  user,
  fallbackColor,
  solidColor,
  ...avatarProps
}: UserAvatarProps) => {
  const mainColor = useMemo(
    () => !user?.extra?.picture ? (fallbackColor || randomColor()) : "#000", 
    [user?.extra?.picture, fallbackColor]
  );
  const textColor = useMemo(
    () => !user?.extra?.picture ? colorContrast(mainColor) : "#000", 
    [user?.extra?.picture, mainColor]
  );

  return (
    <Avatar
      {...avatarProps}
      src={user?.extra?.picture}
      alt={`${user?.first_name} ${user?.last_name}`}
      imageProps={{
        referrerPolicy: "no-referrer",
        className: "w-full h-full object-cover",
      }}
      color={solidColor ? undefined : mainColor}
      bg={solidColor ? mainColor : undefined}
    >
      {
        user 
        ? (
          <span style={{ color: solidColor ? textColor : undefined }}>
            {`${user?.first_name ? user?.first_name[0]?.toUpperCase() : ""}${user?.last_name ? user?.last_name[0]?.toUpperCase() : ""}` || "NA"}
          </span>
        ) : <span style={{ color: solidColor ? textColor : undefined }}>NA</span>
      }
    </Avatar>
  );
};

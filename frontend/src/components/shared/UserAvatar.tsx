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

const stringToHslColor = (str: string, s: number, l: number) => {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  var h = hash % 360;
  // return "hsl(" + h + ", " + s + "%, " + l + "%)";
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0"); // convert to Hex and prefix "0" if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

export const UserAvatar = ({
  user,
  fallbackColor,
  solidColor,
  ...avatarProps
}: UserAvatarProps) => {
  const color = stringToHslColor(
    user?.first_name || user?.last_name
      ? user?.first_name
        ? user.first_name
        : "" + user?.last_name
        ? user?.last_name
        : ""
      : "",
    60,
    60
  );
  const mainColor = useMemo(
    () => (!user?.extra?.picture ? fallbackColor || color : "#000"),
    [user?.extra?.picture, fallbackColor]
  );
  const textColor = useMemo(
    () => (!user?.extra?.picture ? colorContrast(color) : "#000"),
    [user?.extra?.picture, color]
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
      color={color}
      bg={color}
    >
      {user ? (
        <span style={{ color: solidColor ? textColor : undefined }}>
          {`${user?.first_name ? user?.first_name[0]?.toUpperCase() : ""}` ||
            "NA"}
        </span>
      ) : (
        <span style={{ color: solidColor ? textColor : undefined }}>NA</span>
      )}
    </Avatar>
  );
};

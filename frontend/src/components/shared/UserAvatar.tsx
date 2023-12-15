import { Avatar, AvatarProps } from "@mantine/core";
import { FC, useMemo } from "react";

import { User } from "@/api/services/auth/types";
import { 
  randomColor, 
  // colorContrast,
} from "@/utils/color";

export interface UserAvatarProps extends AvatarProps {
  user: User | null;
  fallbackColor?: string;
}

export const UserAvatar: FC<UserAvatarProps> = ({ user, fallbackColor, ...avatarProps }) => {
  const color = useMemo(
    () => !user?.extra?.picture ? (fallbackColor || randomColor()) : "#000", 
    [user?.extra?.picture, fallbackColor]
  );
  // const color = useMemo(
  //   () => !user?.extra?.picture ? colorContrast(backgroundColor) : "#000", 
  //   [user?.extra?.picture, backgroundColor]
  // );

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
    >
      {
        user 
        ? `${user?.first_name ? user?.first_name[0]?.toUpperCase() : ""}${user?.last_name ? user?.last_name[0]?.toUpperCase() : ""}` || "NA"
        : "NA"
      }
    </Avatar>
  );
};

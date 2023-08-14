import React from "react";
import IconButton from "@mui/material/IconButton";
import { useRouter } from "next/router";

import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export interface AppBarContentSubmenuProps {
  title?: string;
  info?: React.ReactNode;
}

export const AppBarContentSubmenu: React.FC<AppBarContentSubmenuProps> = ({
  title, info
}) => {
  const router = useRouter();
  const { callbackUrl } = router.query;
  const redirectTo = typeof callbackUrl === "string" && callbackUrl 
    ? callbackUrl
    : "/";

  const onBackButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    router.push(redirectTo);
  };

  return (
    <div className="flex ml-2 mr-6 gap-2 items-center md:py-3">
      <IconButton 
        color="inherit"
        onClick={onBackButtonClick}
      >
        <ArrowBackIcon />
      </IconButton>

      <div className="flex flex-col md:flex-row items-center w-full">
        <h1 className="text-2xl flex-1">{title}</h1>
        <span className="text-xs md:text-base">{info}</span>
      </div>
    </div>
  );
}
import React from "react";
import LoadingButton, { LoadingButtonProps } from '@mui/lab/LoadingButton';
import classNames from "classnames";

export const Button: React.FC<LoadingButtonProps> = ({ children, color, classes, ...props }) => {
  let textColorClass = "!text-forem-green-500";
  let bgColorClass = "!bg-forem-green-500";
  let borderColorClass = "!border-forem-green-500";
  if (props.disabled) {
    textColorClass = "!text-[rgba(155, 154, 154, 0.3)]";
    bgColorClass = "!bg-[rgba(155, 154, 154, 0.3)]";
    borderColorClass = "!border-[rgba(155, 154, 154, 0.3)]";
  }
  else {
    switch (color) {
      case "primary":
        textColorClass = "!text-forem-green-500";
        bgColorClass = "!bg-forem-green-500";
        borderColorClass = "!border-forem-green-500";
        break;
      case "error":
        textColorClass = "!text-forem-red-500";
        bgColorClass = "!bg-forem-red-500";
        borderColorClass = "!border-forem-red-500";
        break;
      case "info":
        textColorClass = "!text-forem-blue-500";
        bgColorClass = "!bg-forem-blue-500";
        borderColorClass = "!border-forem-blue-500";
        break;
      case "warning":
        textColorClass = "!text-forem-yellow-500";
        bgColorClass = "!bg-forem-yellow-500";
        borderColorClass = "!border-forem-yellow-500";
        break;
      case "inherit":
        textColorClass = "!text-inherit";
        bgColorClass = "!bg-inherit";
        borderColorClass = "!border-current";
    }
  }

  return (
    <LoadingButton
      {...props}
      classes={{
        ...classes,
        root:  classNames("!normal-case", classes?.root),
        outlined: classNames("!rounded-[100px] !py-1.5 !px-4 !font-normal !text-base", classes?.outlined, borderColorClass, textColorClass),
        contained: classNames("!text-white !rounded-2xl !py-4 !px-5 !font-medium !text-sm", classes?.contained, bgColorClass),
        disabled: classNames("!text-forem-neutral-500 !border-forem-neutral-500", classes?.disabled),
      }}
    >
      {children}
    </LoadingButton>
  );
}
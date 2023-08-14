import React from "react";
import { SxProps, Theme } from "@mui/system";
import { FieldValues } from "react-hook-form";

import { Switch as BaseSwitch, SwitchProps as BaseSwitchProps } from "@/components/shared/hook-form";
import classNames from "classnames";

export type SwitchProps<TFieldValues extends FieldValues = FieldValues> = {
  title?: React.ReactNode;
  /**
   * The component used to render the title container
   * @default label
   */
  titleAs?: React.ElementType;
  classes?: {
    title?: {
      /**
       * Style applied to the <label> tag containing the input
       */
      root?: string,
      /**
       * Style applied to the <span> that wraps the label prop
       */
      label?: string,
    }
  };
} & BaseSwitchProps<TFieldValues>;

export const Switch = <TFieldValues extends FieldValues = FieldValues>({ 
  sx, title, titleAs, ...props 
}: SwitchProps<TFieldValues>) => {
  const TitleAs = titleAs ?? "label";
  
  return (
    <TitleAs className={props?.classes?.title?.root}>
      {title ? (
        <span className={`block font-bold ${props?.classes?.title?.label}`}>
          {title}
        </span>
      ) : null}
      <label className="flex items-center gap-2 font-medium px-2">
        <span>No</span>
        <BaseSwitch
          {...props}
          // Proper sx deconstruction: https://mui.com/system/getting-started/the-sx-prop/#passing-sx-prop
          sx={[
            ...(Array.isArray(switchSx) ? switchSx : [switchSx]),
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
          classes={{
            ...props?.classes,
            formControlLabel: {
              ...props?.classes?.formControlLabel,
              root: classNames("!m-0", props?.classes?.formControlLabel?.root),
            },
          }}
        />
        <span>Sí</span>
      </label>
    </TitleAs>
  );
}

export const switchSx: SxProps<Theme> = {
  width: 52,
  height: 32,
  padding: 0,
  marginLeft: 0,
  marginRight: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "150ms",
    "&.Mui-checked": {
      transform: "translateX(22px)",
      color: "#fff",
      "& .MuiSwitch-thumb": {
        backgroundColor: "#FFFFFF",
      },
      '& .MuiSwitch-thumb:before': {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.0001 10.7799L3.2201 7.9999L2.27344 8.9399L6.0001 12.6666L14.0001 4.66656L13.0601 3.72656L6.0001 10.7799Z" fill="${encodeURIComponent('#3B82F6')}"/></svg>')`,
      },
      "& + .MuiSwitch-track": {
        backgroundColor: "#3B82F6",
        opacity: 1,
        border: 0,
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#33cf4d",
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color: "gray-100",
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: 0.3,
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 24,
    height: 24,
    backgroundColor: "#9B9A9A",
    '&:before': {
      content: "''",
      position: 'absolute',
      width: '60%',
      height: '60%',
      left: "20%",
      top: "22%",
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundImage: `url('data:image/svg+xml;utf8,<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.6666 4.27325L11.7266 3.33325L7.99992 7.05992L4.27325 3.33325L3.33325 4.27325L7.05992 7.99992L3.33325 11.7266L4.27325 12.6666L7.99992 8.93992L11.7266 12.6666L12.6666 11.7266L8.93992 7.99992L12.6666 4.27325Z" fill="white"/></svg>')`,
    },
  },
  "& .MuiSwitch-thumb, & .MuiTouchRipple-root, & .MuiSwitch-input": {
    transform: "translate(-13px, -12px)",
    color: "#007E48",
  },
  "& .MuiSwitch-track": {
    borderRadius: "100px",
    backgroundColor: "rgba(155, 154, 154, 0.5)",
    opacity: 1,
    transition: "background-color 500ms",
  },
  "& .Mui-disabled": {
    "& .MuiSwitch-thumb": {
      backgroundColor: "#FBFBFB",
    },
  },
}
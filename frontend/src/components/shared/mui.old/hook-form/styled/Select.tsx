import React, { ReactNode } from "react";
import { SxProps, Theme } from "@mui/system";
import { FieldValues } from "react-hook-form";
import MenuItem from "@mui/material/MenuItem";

import { Select as BaseSelect, SelectProps as BaseSelectProps } from "@/components/shared/mui.old/hook-form";

export interface SelectOption {
  label: ReactNode;
  value: string | number;
}

export type SelectProps<TFieldValues extends FieldValues = FieldValues> = {
  options?: SelectOption[];
  title?: React.ReactNode;
  /**
   * The component used to render the title container
   * @default div
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
} & BaseSelectProps<TFieldValues>;

export const Select = <TFieldValues extends FieldValues = FieldValues>({ 
  children, options, classes, sx, MenuProps, title, titleAs, ...props
}: SelectProps<TFieldValues>) => {
  const variantProp = props.variant === "filled" ? {
    disableUnderline: true
  } : undefined;
  const menuPropsSx = MenuProps?.sx;
  const TitleAs = titleAs ?? "div";
  
  return (
    <TitleAs className={`${classes?.title?.root} ${props?.fullWidth ? "w-full" : "" }`}>
      {title ? (
        <span className={`font-bold ${classes?.title?.label}`}>
          {title}
        </span>
      ) : null}
      <BaseSelect
        {...variantProp}
        {...props}
        sx={[
          ...(Array.isArray(selectSx) ? selectSx : [selectSx]),
          ...(Array.isArray(sx) ? sx : [sx])
        ]}
        MenuProps={{
          ...MenuProps,
          sx: [
            ...(Array.isArray(selectMenuSx) ? selectMenuSx : [selectMenuSx]),
            ...(Array.isArray(menuPropsSx) ? menuPropsSx : [menuPropsSx])
          ]
        }}
      >
        {options?.map(opt => (
          <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
        ))}
        {children}
      </BaseSelect>
    </TitleAs>
  );
}

export const selectSx: SxProps<Theme> = {
  "& .MuiSelect-select": {
    padding: "0.5rem"
  },
  "&.MuiInputBase-root, & .MuiSelect-select": {
    borderRadius: "0.25rem",
  },
  "&.MuiInputBase-root": {
    "& > .MuiOutlinedInput-notchedOutline": {
      borderColor: "#d4d4d4",
    },
    "&:hover:not(.Mui-error):not(.Mui-disabled) > .MuiOutlinedInput-notchedOutline": {
      borderColor: "#000",
    },
    "&.MuiFilledInput-root": {
      border: "1px solid transparent",
      borderRadius: "0.25rem",
    },
    "&.Mui-error": {
      "& .MuiOutlinedInput-notchedOutline, &.MuiFilledInput-root": {
        borderColor: "#d32f2f"
      },
      "&.MuiFilledInput-root.Mui-focused": {
        boxShadow: "inset 0 0 0 1px #d32f2f"
      },
    },
    "&.Mui-disabled": {
      "&.MuiOutlinedInput-root": {
        "& .MuiSelect-select": {
          color: "#79747E",
          WebkitTextFillColor: "#79747E",
        },
      },
      "&.MuiFilledInput-root": {
        backgroundColor: "rgba(155, 154, 154, 0.2)",
      },
    },
  },
}

export const selectMenuSx: SxProps<Theme> = {
  "& .MuiMenuItem-root": {
    color: "#1D1D1B",
    "&:hover": {
      backgroundColor: "rgb(59 130 246 / 0.2) !important",
    },
  },
  "& ul > .Mui-selected": {
    backgroundColor: "rgb(59 130 246 / 0.1) !important",
    color: "#5a99f2 !important",
  },
}
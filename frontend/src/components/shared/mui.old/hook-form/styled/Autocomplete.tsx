import React from "react";
import { SxProps, Theme } from "@mui/system";
import { FieldValues } from "react-hook-form";
import { TextFieldProps } from "@mui/material/TextField";

import { Autocomplete as BaseAutocomplete, AutocompleteProps as BaseAutocompleteProps } from "@/components/shared/mui.old/hook-form";
import { ChipTypeMap } from "@mui/material/Chip";

export type AutocompleteProps<
  T,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
  TFieldValues extends FieldValues = FieldValues,
  ChipComponent extends React.ElementType = ChipTypeMap['defaultComponent']
> = {
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
} & BaseAutocompleteProps<T, Multiple, DisableClearable, FreeSolo, TFieldValues, ChipComponent>
& Pick<TextFieldProps, "variant">;

export const Autocomplete = <
T,
DisableClearable extends boolean | undefined = undefined,
FreeSolo extends boolean | undefined = undefined,
TFieldValues extends FieldValues = FieldValues,
>({ 
  variant, textFieldProps, title, titleAs, ListboxProps, ...props 
}: AutocompleteProps<T, false, DisableClearable, FreeSolo, TFieldValues>) => {
  const variantProp = variant === "filled" ? {
    disableUnderline: true
  } : undefined;
  const sx = textFieldProps?.sx;
  const TitleAs = titleAs ?? "label";
  const listPropsSx = ListboxProps?.sx;

  return (
    <TitleAs className={`${props?.classes?.title?.root} ${props?.fullWidth ? "w-full" : "" }`}>
      {title ? (
        <span className={`font-bold ${props?.classes?.title?.label}`}>
          {title}
        </span>
      ) : null}
      <BaseAutocomplete
        {...props}
        textFieldProps={{
          ...textFieldProps,
          variant,
          InputProps: {
            ...variantProp,
            ...textFieldProps?.InputProps,
          },
          sx: [
            ...(Array.isArray(autocompleteSx) ? autocompleteSx : [autocompleteSx]),
            ...(Array.isArray(sx) ? sx : [sx])
          ],
        }}
        ListboxProps={{
          sx: [
            ...(Array.isArray(autocompleteListboxSx) ? autocompleteListboxSx : [autocompleteListboxSx]),
            ...(Array.isArray(listPropsSx) ? listPropsSx : [listPropsSx])
          ]
        }}
      />
    </TitleAs>
  )
}

export const autocompleteSx: SxProps<Theme> = {
  "& .MuiInputBase-root, & .MuiOutlinedInput-root ": {
    borderRadius: "0.25rem",
    padding: "0.5rem",
  },
  "& .MuiInputBase-root .MuiInputBase-input": {
    paddingY: 0,
  },
  "& .MuiOutlinedInput-root": {
    "&.MuiInputBase-root": {
      "& > fieldset": {
        borderColor: "#d4d4d4",
      },
      ":hover:not(.Mui-disabled) > fieldset": {
        borderColor: "#000",
      },
      "&.Mui-error > fieldset": {
        borderColor: "#d32f2f"
      },
      "&.Mui-disabled": {
        // backgroundColor: "rgba(155, 154, 154, 0.2)",
        "& .MuiInputBase-input": {
          color: "#79747E",
          WebkitTextFillColor: "#79747E",
        },
        "&:not(.Mui-error) > fieldset": {
          // border: "none",
        },
      },
    },
  },
  "& .MuiFilledInput-root": {
    border: "1px solid transparent",
    borderRadius: "0.25px",
    "&.Mui-focused, &:hover:valid": {
      backgroundColor: "rgba(155, 154, 154, 0.2)",
    },
    "&.Mui-error": {
      borderColor: "#d32f2f",
      "&.Mui-focused": {
        boxShadow: "inset 0 0 0 1px #d32f2f"
      },
    },
  },
}

export const autocompleteListboxSx: SxProps<Theme> = {
  "& .MuiAutocomplete-option": {
    color: "#1D1D1B",
    "&:hover": {
      backgroundColor: "rgb(59 130 246 / 0.2) !important",
    },
    "&[aria-selected='true']": {
      backgroundColor: "rgb(59 130 246 / 0.1) !important",
      color: "#64a5ff !important",
    },
  },
}

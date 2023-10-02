import React from "react";
import { SxProps, Theme } from "@mui/system";
import { FieldValues } from "react-hook-form";

import { TextInput as BaseTextInput, TextInputProps as BaseTextInputProps } from "@/components/shared/mui.old/hook-form";

import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

export type TextInputProps<TFieldValues extends FieldValues = FieldValues> = {
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
} & BaseTextInputProps<TFieldValues>;

export const TextInput = <TFieldValues extends FieldValues = FieldValues>({ 
  children, sx, InputProps, title, titleAs, ...props
}: TextInputProps<TFieldValues>) => {
  const variantProp = props.variant === "filled" ? {
    disableUnderline: true
  } : undefined;
  const TitleAs = titleAs ?? "label";

  return (
    <TitleAs className={`${props?.classes?.title?.root} ${props?.fullWidth ? "w-full" : "" }`}>
      {title ? (
        <span className={`font-bold ${props?.classes?.title?.label}`}>
          {title}
        </span>
      ) : null}
      <BaseTextInput
        PasswordVisibilityOffIcon={VisibilityOffOutlinedIcon}
        PasswordVisibilityOnIcon={VisibilityOutlinedIcon}
        {...props}
        InputProps={{
          ...variantProp,
          ...InputProps,
        }}
        sx={[
          ...(Array.isArray(textInputSx) ? textInputSx : [textInputSx]),
          ...(Array.isArray(sx) ? sx : [sx])
        ]}
      >
        {children}
      </BaseTextInput>
    </TitleAs>
  );
}

export const textInputSx: SxProps<Theme> = {
  "& .MuiInputBase-root, & .MuiOutlinedInput-root .MuiInputBase-input": {
    borderRadius: "0.25rem",
  },
  "& .MuiInputBase-input": {
    padding: "0.5rem"
  },
  "& .MuiOutlinedInput-root": {
    "& > fieldset": {
      borderColor: "#d4d4d4",
      "&:hover": {
        borderColor: "#000",
      },
    },
    "&.Mui-focused > fieldset": {
      borderColor: "#000",
    },
    "&.Mui-error > fieldset": {
      borderColor: "#d32f2f"
    },
    "&.Mui-disabled": {
      "& > .MuiInputBase-input": {
        color: "#79747E",
        WebkitTextFillColor: "#79747E",
      },
    }
  },
  "& .MuiFilledInput-root": {
    border: "1px solid transparent",
    "& .MuiInputBase-input": {
      boxShadow: "none !important",
    },
    "&.Mui-error": {
      borderColor: "#d32f2f",
    },
    "&.Mui-focused.Mui-error .MuiInputBase-input": {
      boxShadow: "inset 0 0 0 1px #d32f2f"
    },
    "&.Mui-focused, &:hover:valid": {
      backgroundColor: "rgba(155, 154, 154, 0.2)",
    },
    "&.Mui-disabled": {
      backgroundColor: "rgba(155, 154, 154, 0.2)",
      "& > .MuiInputBase-input": {
        color: "#79747E",
        WebkitTextFillColor: "#79747E",
      },
    },
  },
  "& .MuiInputBase-multiline": {
    padding: 0,
  },
  "& .MuiInputBase-inputMultiline": {
    borderRadius: "0 !important",
  }
}
"use client";

import React, { useState } from "react";
import { TextField, type TextFieldProps, TextFieldClasses } from "@mui/material";
import { Controller, FieldError, FieldValues, useFormContext } from "react-hook-form";
import { FormInputConditionalProps } from "./Form";

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

export interface TextInputBaseProps extends Omit<TextFieldProps, "name" | "classes"> {
  showPasswordToggle?: boolean;
  classes?: {
    textField?: Partial<TextFieldClasses>,
    passwordVisibilityOn?: string,
    passwordVisibilityOff?: string,
    passwordToggle?: string;
  }
  PasswordVisibilityOnIcon?: React.JSXElementConstructor<any>;
  PasswordVisibilityOffIcon?: React.JSXElementConstructor<any>;
};

export type TextInputProps<TFieldValues extends FieldValues = FieldValues> = TextInputBaseProps & FormInputConditionalProps<TFieldValues>;

export const TextInput = <TFieldValues extends FieldValues = FieldValues>({
  children, name, rules, shouldUnregisterField, defaultFieldValue,
  showPasswordToggle, classes, error: componentError,
  helperText, inputProps, type, fullWidth,
  onChange: _onChange, onBlur: _onBlur,
  PasswordVisibilityOnIcon, PasswordVisibilityOffIcon,
  ...textFieldProps
}: TextInputProps<TFieldValues>) => {
  const [inputType, setInputType] = useState<React.HTMLInputTypeAttribute>(type || "text");
  const formMethods = useFormContext();
  let fieldError: FieldError | undefined = undefined;

  if (formMethods) { 
    // Subscription to errors from formState since is a condition to get the field error from getFieldState
    const { getFieldState, formState: { errors: formErrors } } = formMethods;
    const { error: fieldStateError } = getFieldState(name as any)
    fieldError = fieldStateError;
  }
  const error = componentError || !!fieldError;

  const getPasswordToggleIcon = () => {
    const VisibilityOff = PasswordVisibilityOnIcon || VisibilityOffIcon;
    const VisibilityOn = PasswordVisibilityOffIcon || VisibilityIcon;

    if (inputType === "text")
      return <VisibilityOff className={classes?.passwordVisibilityOff} />;
    else if (inputType === "password")
      return <VisibilityOn className={classes?.passwordVisibilityOn} />;
    
    return null;
  };

  const toggleShowPassword = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (!showPasswordToggle) return;

    setInputType((prev) => {
      if (prev === "text") return "password";
      return "text";
    });
  };

  return (
    <div
      className={`flex relative ${fullWidth ? "w-full" : ""}`}
    >
      {formMethods && name ? (
        <Controller 
          name={name}
          control={formMethods.control}
          rules={rules}
          shouldUnregister={shouldUnregisterField}
          defaultValue={defaultFieldValue}
          render={({field: { onChange, onBlur, value, ref }}) => (
            <TextField
              {...textFieldProps}
              name={name}
              inputRef={ref}
              type={inputType}
              helperText={fieldError?.message || helperText}
              error={error}
              fullWidth={fullWidth}
              classes={classes?.textField}
              inputProps={{
                ...inputProps,
                className:
                  `${showPasswordToggle ? "pr-9 " : ""}` +
                  (inputProps?.className || ""),
              }}
              onChange={(e) => {
                onChange(e);
                _onChange && _onChange(e);
              }}
              onBlur={(e) => {
                onBlur();
                _onBlur && _onBlur(e);
              }}
              value={value}
            >
              {children}
            </TextField>
          )}
        />
      ) : (
        <TextField
          {...textFieldProps}
          name={name}
          type={inputType}
          helperText={fieldError?.message || helperText}
          error={error}
          fullWidth={fullWidth}
          inputProps={{
            ...inputProps,
            className:
              `${showPasswordToggle ? "pr-9 " : ""}` +
              (inputProps?.className || ""),
          }}
          onBlur={_onBlur}
          onChange={_onChange}
        >
          {children}
        </TextField>
      )}
      {showPasswordToggle && (inputType === "text" || inputType === "password") && !textFieldProps.disabled ? (
        <button
          type="button"
          onClick={toggleShowPassword}
          className={`right-2 ${classes?.passwordToggle}`}
          disabled={textFieldProps.disabled}
          style={{
            display: "block",
            position: "absolute",
            transform: "translateY(65%)",
          }}
        >
          {getPasswordToggleIcon()}
        </button>
      ) : null}
    </div>
  );
};

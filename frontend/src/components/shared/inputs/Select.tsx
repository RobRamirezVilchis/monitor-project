import React from "react";
import FormControl, { FormControlClasses } from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import MuiSelect, { SelectClasses, type SelectProps as MuiSelectProps } from "@mui/material/Select";
import { Controller, FieldError, FieldValues, useFormContext } from "react-hook-form";
import MenuItem, { MenuItemClasses } from "@mui/material/MenuItem";

import { FormInputConditionalProps } from "./Form";

export interface SelectBaseProps extends Omit<MuiSelectProps, "name" | "placeholder" | "classes"> {
  /**
   * Renders a MenuItem with value of "" to be shown as a placeholder for the Select component
   */
  placeholder?: React.ReactNode;
  helperText?: string;
  disablePlaceholder?: boolean;
  classes?: {
    select?: Partial<SelectClasses>;
    formControl?: Partial<FormControlClasses>;
    placeholder?: Partial<MenuItemClasses>;
  }
  error?: boolean;
}

export type SelectProps<TFieldValues extends FieldValues = FieldValues> = SelectBaseProps & FormInputConditionalProps<TFieldValues>;

export const Select = <TFieldValues extends FieldValues = FieldValues>({ 
    children, name, rules, shouldUnregisterField, defaultFieldValue, displayEmpty,
    fullWidth, helperText, error: componentError,
    placeholder, disablePlaceholder, className, classes,
    onChange: _onChange, onBlur: _onBlur, value: _value,
    ...selectProps 
}: SelectProps<TFieldValues>) => {
  const formMethods = useFormContext();
  let fieldError: FieldError | undefined = undefined;

  if (formMethods) { 
    // Subscription to errors from formState since is a condition to get the field error from getFieldState
    const { getFieldState, formState: { errors: formErrors } } = formMethods;
    const { error: fieldStateError } = getFieldState(name as any)
    fieldError = fieldStateError;
  }
  const error = componentError || !!fieldError;
  
  return (
    <FormControl error={error} fullWidth={fullWidth} classes={classes?.formControl}>
      {formMethods && name ? (
        <Controller 
          name={name}
          control={formMethods.control}
          rules={rules}
          shouldUnregister={shouldUnregisterField}
          defaultValue={defaultFieldValue}
          render={({field: { onChange, onBlur, value, ref }}) => (
            <MuiSelect
              {...selectProps}
              name={name}
              fullWidth={fullWidth}
              inputRef={ref}
              value={value}
              onChange={(e, c) => {
                onChange(e, c);
                _onChange && _onChange(e, c);
              }}
              onBlur={(e) => {
                onBlur();
                _onBlur && _onBlur(e);
              }}
              displayEmpty={displayEmpty || !!placeholder}
              className={(placeholder && value === "" ? "!text-disabled-black " : "") + className}
              classes={classes?.select}
            >
              {placeholder ? (
                <MenuItem value="" disabled={disablePlaceholder} classes={classes?.placeholder}>
                  {placeholder}
                </MenuItem>
              ) : null}
              {children}
            </MuiSelect>
          )}
        />
      ) : (
        <MuiSelect
            {...selectProps}
            name={name}
            fullWidth={fullWidth}
            onChange={_onChange}
            onBlur={_onBlur}
            value={_value}
            displayEmpty={displayEmpty || !!placeholder}
            className={(placeholder && _value === "" ? "!text-disabled-black " : "") + className}
            classes={classes?.select}
          >
            {placeholder ? (
              <MenuItem value="" disabled={disablePlaceholder} classes={classes?.placeholder}>
                {placeholder}
              </MenuItem>
            ) : null}
            {children}
          </MuiSelect>
      )}
      {fieldError?.message || helperText ? (
        <FormHelperText>{fieldError?.message || helperText}</FormHelperText>
      ) : null}
    </FormControl>
  );
};
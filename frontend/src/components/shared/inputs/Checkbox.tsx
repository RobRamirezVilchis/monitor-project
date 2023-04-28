import React from "react";
import { Controller, FieldError, FieldValues, useFormContext } from "react-hook-form";
import MuiCheckbox, { CheckboxClasses, CheckboxProps as MuiCheckboxProps } from "@mui/material/Checkbox";
import FormControl, { FormControlClasses } from "@mui/material/FormControl";
import FormHelperText, { FormHelperTextClasses } from "@mui/material/FormHelperText";
import FormControlLabel, { FormControlLabelClasses, FormControlLabelProps } from "@mui/material/FormControlLabel"

import { FormInputConditionalProps } from "./Form";

export interface CheckboxBaseProps extends Omit<MuiCheckboxProps, "name" | "classes">,
  Pick<FormControlLabelProps, "label" | "labelPlacement"> {
  helperText?: string;
  classes?: {
    checkbox?: Partial<CheckboxClasses>;
    formControl?: Partial<FormControlClasses>;
    formHelperText?: Partial<FormHelperTextClasses>;
    formControlLabel?: Partial<FormControlLabelClasses>;
  }
  error?: boolean;
}

export type CheckboxProps<TFieldValues extends FieldValues = FieldValues> = CheckboxBaseProps & FormInputConditionalProps<TFieldValues>;

export const Checkbox = <TFieldValues extends FieldValues = FieldValues>({
  name, rules, shouldUnregisterField, defaultFieldValue, classes,
  label, labelPlacement, helperText, disabled, 
  error: componentError,
  onChange: _onChange, onBlur: _onBlur,
  ...checkboxProps
}: CheckboxProps<TFieldValues>) => {
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
    <FormControl error={error} classes={classes?.formControl}>
      <FormControlLabel
        label={label}
        disabled={disabled}
        labelPlacement={labelPlacement}
        classes={classes?.formControlLabel}
        control={
          <>
          {formMethods && name ? (
            <Controller
              name={name}
              control={formMethods.control}
              rules={rules}
              shouldUnregister={shouldUnregisterField}
              defaultValue={defaultFieldValue}
              render={({field: { onChange, onBlur, value, ref }}) => (
                <MuiCheckbox
                  {...checkboxProps}
                  onChange={(e, c) => {
                    onChange(e, c);
                    _onChange && _onChange(e, c);
                  }}
                  onBlur={(e) => {
                    onBlur();
                    _onBlur && _onBlur(e);
                  }}
                  inputRef={ref}
                  checked={value}
                  disabled={disabled}
                  classes={classes?.checkbox}
                />
              )}
            />
          ) : (
            <MuiCheckbox 
              name={name} 
              {...checkboxProps}
              onBlur={_onBlur}
              onChange={_onChange}
              classes={classes?.checkbox}
              disabled={disabled}
            />
          )}
          </>
        }
      />
      {fieldError?.message || helperText ? (
        <FormHelperText classes={classes?.formHelperText}>{fieldError?.message || helperText}</FormHelperText>
      ) : null}
    </FormControl>
  );
}
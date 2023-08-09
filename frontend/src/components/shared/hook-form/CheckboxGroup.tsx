"use client";

import React from "react";
import { Controller, FieldError, FieldValues, useFormContext, UseFormTrigger } from "react-hook-form";
import MuiCheckbox, { CheckboxProps as MuiCheckboxProps } from "@mui/material/Checkbox";
import FormControl, { FormControlClasses } from "@mui/material/FormControl";
import FormHelperText, { FormHelperTextClasses } from "@mui/material/FormHelperText";
import FormControlLabel, { FormControlLabelClasses, FormControlLabelProps } from "@mui/material/FormControlLabel"
import FormGroup, { FormGroupClasses, FormGroupProps } from "@mui/material/FormGroup";

import { FormInputProps } from "./Form";

export interface CheckboxGroupBaseProps extends 
  Pick<FormControlLabelProps, "labelPlacement">,
  Pick<FormGroupProps, "row"> {
  options: { 
    label: React.ReactNode;
    name: string | number;
    checked: boolean;
  }[];
  helperText?: string;
  checkboxProps?: Omit<MuiCheckboxProps, "name" | "onChange" | "onBlur" | "inputRef" | "checked">;
  classes?: {
    formGroup?: Partial<FormGroupClasses>;
    formControl?: Partial<FormControlClasses>;
    formControlLabel?: Partial<FormControlLabelClasses>;
    formHelperText?: Partial<FormHelperTextClasses>;
  }
  error?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
}

export type CheckboxGroupProps<TFieldValues extends FieldValues = FieldValues> = CheckboxGroupBaseProps & FormInputProps<TFieldValues>;

export const CheckboxGroup = <TFieldValues extends FieldValues = FieldValues>({
  name, rules, shouldUnregisterField, defaultFieldValue,
  labelPlacement, helperText, row, options,
  checkboxProps, classes, error: componentError, onChange: _onChange
}: CheckboxGroupProps<TFieldValues>) => {
  const formMethods = useFormContext();
  let fieldError: FieldError | undefined = undefined;
  
  if (formMethods) { 
    // Subscription to errors from formState since is a condition to get the field error from getFieldState
    const { getFieldState, formState: { errors: formErrors } } = formMethods;
    const { error: fieldStateError } = getFieldState(name)
    fieldError = fieldStateError;
  }
  const error = componentError || !!fieldError;
  
  return (
    <FormControl error={error} classes={classes?.formControl}>
      <Controller
        name={name}
        control={formMethods.control}
        rules={rules}
        shouldUnregister={shouldUnregisterField}
        defaultValue={defaultFieldValue}
        render={({ field: { ref: containerRef } }) => (
          <FormGroup row={row} classes={classes?.formGroup}>
            {options.map((opt, idx) => (
              <FormControlLabel
                key={opt.name}
                label={opt.label}
                labelPlacement={labelPlacement}
                classes={classes?.formControlLabel}
                control={ 
                  <Controller
                    name={`${name}.${opt.name}` as any}
                    control={formMethods.control}
                    render={({field: { onChange, onBlur, value, ref }}) => (
                      <MuiCheckbox
                        {...checkboxProps}
                        name={name}
                        onChange={(e, c) => {
                          onChange(e, c);
                          _onChange && _onChange(e, c);
                          formMethods.trigger(name);
                        }}
                        onBlur={(e) => {
                          onBlur();
                          formMethods.trigger(name);
                        }}
                        inputRef={e => {
                          ref(e);
                          if (idx === 0) containerRef(e);
                        }}
                        checked={value}
                      />
                    )}
                  />
                }
              />
            ))}
          </FormGroup>
        )}
      />
      {fieldError?.message || helperText ? (
        <FormHelperText classes={classes?.formHelperText}>{fieldError?.message || helperText}</FormHelperText>
      ) : null}
    </FormControl>
  );
};

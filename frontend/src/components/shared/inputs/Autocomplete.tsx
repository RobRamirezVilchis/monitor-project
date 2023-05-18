"use client";

import React from "react";
import FormControl, { FormControlClasses } from "@mui/material/FormControl";
import FormHelperText, { FormHelperTextClasses } from "@mui/material/FormHelperText";
import MuiAutocomplete, { AutocompleteClasses, AutocompleteProps as MuiAutocompleteProps } from "@mui/material/Autocomplete";
import TextField, { TextFieldClasses, TextFieldProps } from "@mui/material/TextField";
import { Controller, FieldError, FieldValues, useFormContext } from "react-hook-form";
import { ChipTypeMap } from "@mui/material/Chip";

import { FormInputConditionalProps } from "./Form";

export interface AutocompleteBaseProps<
  T,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
  ChipComponent extends React.ElementType = ChipTypeMap['defaultComponent']
> extends Omit<
    MuiAutocompleteProps<T, Multiple, DisableClearable, FreeSolo, ChipComponent>, 
    "renderInput" | "classes"
  > {
  inputPlaceholder?: string;
  helperText?: string;
  classes?: {
    autocomplete?: Partial<AutocompleteClasses>;
    formHelperText?: Partial<FormHelperTextClasses>;
    formControl?: Partial<FormControlClasses>;
  }
  textFieldProps?: Omit<TextFieldProps, "error" | "fullWidth" | "onBlur" | "onChange" | "inputRef">
  error?: boolean;
}

export type AutocompleteProps<
T,
Multiple extends boolean | undefined,
DisableClearable extends boolean | undefined,
FreeSolo extends boolean | undefined,
TFieldValues extends FieldValues = FieldValues,
ChipComponent extends React.ElementType = ChipTypeMap['defaultComponent'],
> = AutocompleteBaseProps<T, Multiple, DisableClearable, FreeSolo, ChipComponent> & FormInputConditionalProps<TFieldValues>

export const Autocomplete = <
  T,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined,
  TFieldValues extends FieldValues = FieldValues,
>({
  name, rules, shouldUnregisterField, defaultFieldValue,
  helperText, noOptionsText, inputPlaceholder,
  fullWidth, freeSolo, classes, textFieldProps,
  error: componentError, 
  onChange: _onChange, onBlur: _onBlur,
  ...autocompleteProps
}: AutocompleteProps<T, false, DisableClearable, FreeSolo, TFieldValues>) => {
  const formMethods = useFormContext();
  let fieldError: FieldError | undefined = undefined;

  if (formMethods) { 
    // Subscription to errors from formState since is a condition to get the field error from getFieldState
    const { getFieldState, formState: { errors: formErrors } } = formMethods;
    const { error: fieldStateError } = getFieldState(name as any)
    fieldError = fieldStateError;
  }
  const error = componentError || !!fieldError;

  const { inputProps, InputLabelProps, ...baseTextFieldProps } = 
    textFieldProps || { inputProps: undefined, InputProps: undefined };

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
            <MuiAutocomplete
              {...autocompleteProps}
              noOptionsText={noOptionsText || "Sin opciones"}
              fullWidth={fullWidth}
              freeSolo={freeSolo}
              classes={classes?.autocomplete}
              renderInput={(params) => (
                <TextField 
                  {...textFieldProps}
                  {...params}
                  inputProps={{
                    ...inputProps,
                    ...params.inputProps,
                    className: params.inputProps?.className + " " + inputProps?.className,
                  }}
                  InputProps={{
                    ...textFieldProps?.InputProps,
                    ...params.InputProps,
                    className: params.InputProps.className + " " + textFieldProps?.InputProps?.className
                  }}
                  InputLabelProps={{
                    ...InputLabelProps,
                    ...params.InputLabelProps,
                  }}
                  error={error}
                  placeholder={inputPlaceholder}
                  fullWidth={fullWidth}
                  onChange={freeSolo ? onChange : undefined}
                  onBlur={freeSolo ? onBlur : undefined}
                  inputRef={ref}
                />
              )}
              onChange={(e, v, r, d) => {
                onChange(v);
                _onChange && _onChange(e, v, r, d);
              }}
              onBlur={(e) => {
                onBlur();
                _onBlur && _onBlur(e);
              }}
              value={value}
            />
          )}
        />
      ) : (
        <MuiAutocomplete
          {...autocompleteProps}
          noOptionsText={noOptionsText || "Sin opciones"}
          fullWidth={fullWidth}
          freeSolo={freeSolo}
          classes={classes?.autocomplete}
          renderInput={(params) => (
            <TextField
              {...textFieldProps}
              {...params}
              inputProps={{
                ...inputProps,
                ...params.inputProps,
                className: params.inputProps?.className + " " + inputProps?.className,
              }}
              InputProps={{
                ...textFieldProps?.InputProps,
                ...params.InputProps,
                className: params.InputProps.className + " " + textFieldProps?.InputProps?.className
              }}
              InputLabelProps={{
                ...InputLabelProps,
                ...params.InputLabelProps,
              }}
              error={error}
              placeholder={inputPlaceholder}
              fullWidth={fullWidth}
            />
          )}
          onChange={_onChange}
          onBlur={_onBlur}
        />
      )}
      {fieldError?.message || helperText ? (
        <FormHelperText classes={classes?.formHelperText}>{fieldError?.message || helperText}</FormHelperText>
      ) : null}
    </FormControl>
  );
};

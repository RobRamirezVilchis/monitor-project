import React from "react";
import { Controller, FieldError, FieldValues, useFormContext } from "react-hook-form";
import FormControl, { FormControlClasses } from "@mui/material/FormControl";
import FormHelperText, { FormHelperTextClasses } from "@mui/material/FormHelperText";
import FormControlLabel, { FormControlLabelClasses, FormControlLabelProps } from "@mui/material/FormControlLabel"
import Radio, { RadioProps } from "@mui/material/Radio";
import MuiRadioGroup, { RadioGroupProps as MuiRadioGroupProps } from "@mui/material/RadioGroup";

import { FormInputProps } from "./Form";
import { FormGroupClasses } from "@mui/material/FormGroup";

export interface RadioGroupBaseProps extends 
  Pick<FormControlLabelProps, "labelPlacement">,
  Pick<MuiRadioGroupProps, "row"> {
  options: { 
    label: React.ReactNode;
    value: string;
  }[];
  helperText?: string;
  radioProps?: RadioProps;
  classes?: {
    radioGroup?: Partial<FormGroupClasses>;
    formControl?: Partial<FormControlClasses>;
    formControlLabel?: Partial<FormControlLabelClasses>;
    formHelperText?: Partial<FormHelperTextClasses>;
  }
  error?: boolean;
  disabled?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>, value: string) => void;
}

export type RadioGroupProps<TFieldValues extends FieldValues = FieldValues> = RadioGroupBaseProps & FormInputProps<TFieldValues>;

export const RadioGroup = <TFieldValues extends FieldValues = FieldValues>({
  options, name, rules, shouldUnregisterField, defaultFieldValue,
  labelPlacement, helperText, row, radioProps, disabled,
  classes, error: componentError, onChange: _onChange
}: RadioGroupProps<TFieldValues>) => {
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
    <FormControl error={error} classes={classes?.formControl} disabled={disabled}>
      <Controller
        name={name}
        control={formMethods.control}
        rules={rules}
        shouldUnregister={shouldUnregisterField}
        defaultValue={defaultFieldValue}
        render={({field: { onChange, onBlur, value, ref: containerRef }}) => (
          <MuiRadioGroup 
            name={name}
            onChange={(e, v) => {
              onChange(e, v);
              _onChange && _onChange(e, v);
            }}
            onBlur={onBlur}
            value={value}
            row={row}
            classes={classes?.radioGroup}
          >
            {options.map((opt, idx) => (
              <FormControlLabel
                key={opt.value}
                label={opt.label}
                labelPlacement={labelPlacement}
                value={opt.value}
                classes={classes?.formControlLabel}
                control={<Radio {...radioProps} inputRef={e => idx === 0 && containerRef(e)} />}
              />
            ))}
          </MuiRadioGroup>
        )}
      />
      {fieldError?.message || helperText ? (
        <FormHelperText classes={classes?.formHelperText}>{fieldError?.message || helperText}</FormHelperText>
      ) : null}
    </FormControl>
  );
};

"use client";

import React, { useEffect, useRef, useState } from "react";
import Switch, { SwitchProps } from "@mui/material/Switch";
import { SxProps, Theme } from "@mui/system";
import { Controller, FieldError, FieldValues, useFormContext, UseFormReturn } from "react-hook-form";
import FormControl, { FormControlClasses } from "@mui/material/FormControl";
import FormHelperText, { FormHelperTextClasses } from "@mui/material/FormHelperText";
import FormControlLabel, { FormControlLabelClasses, FormControlLabelProps } from "@mui/material/FormControlLabel"
import clsx from "clsx";

import { FormInputConditionalProps } from "./Form";

export interface TimePickerBaseClasses {
  root: string;
  hourInput: string;
  hourLabel: string;
  minutesInput: string;
  minutesLabel: string;
  separator: string;
}

export interface TimePickerBaseProps {
  time: Date;
  onChange?: (newTime: Date) => void;
  onBlur?: (e: React.FocusEvent<HTMLElement, Element>) => void;
  size?: "small" | "medium" | "large";
  ampm?: boolean;
  disabled?: boolean;
  classes?: Partial<TimePickerBaseClasses>;
  hourLabel?: string;
  minuteLabel?: string;
  switchProps?: Omit<TimeSwitchProps, "disabled" | "isAm" | "name" | "inputRef">;
  hourInputRef?: React.Ref<HTMLInputElement>;
  minutesInputRef?: React.Ref<HTMLInputElement>;
  timeSwitchRef?: React.Ref<HTMLInputElement>;
}

export interface TimeSwitchProps extends Omit<SwitchProps, "checked"> {
  isAm: boolean;
}

export type TimePickerProps<TFieldValues extends FieldValues = FieldValues> = 
  Pick<FormControlLabelProps, "label" | "labelPlacement"> & {
  helperText?: string;
  classes?: {
    timePicker?: Partial<TimePickerBaseClasses>;
    formControl?: Partial<FormControlClasses>;
    formControlLabel?: Partial<FormControlLabelClasses>;
    formHelperText?: Partial<FormHelperTextClasses>;
  }
  error?: boolean;
} & Omit<TimePickerBaseProps, "time"> & FormInputConditionalProps<TFieldValues> & {
  time?: Date;
};
// } & TimePickerBaseProps & FormInputConditionalProps<TFieldValues>;

export const TimePicker = <TFieldValues extends FieldValues = FieldValues>({
  name, rules, shouldUnregisterField, defaultFieldValue,
  helperText, classes, error: componentError, label, labelPlacement, disabled, 
  onChange: _onChange, onBlur: _onBlur, time,
  ...timePickerProps
}: TimePickerProps<TFieldValues>) => {
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
        className="!m-0"
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
                <TimePickerBase
                  {...timePickerProps}
                  classes={classes?.timePicker}
                  onChange={(v) => {
                    onChange(v);
                    _onChange && _onChange(v);
                  }}
                  onBlur={(e) => {
                    onBlur();
                    _onBlur && _onBlur(e);
                  }}
                  hourInputRef={ref}
                  time={value}
                  disabled={disabled}
                />
              )}
            />
          ) : (
            <TimePickerBase 
              {...timePickerProps}
              time={time || new Date()}
              classes={classes?.timePicker}
              onBlur={_onBlur}
              onChange={_onChange}
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

export const TimePickerBase: React.FC<TimePickerBaseProps> = ({ 
  time, onChange, onBlur, size, ampm , classes, disabled, switchProps,
  hourLabel, minuteLabel, hourInputRef, minutesInputRef, timeSwitchRef,
}) => {
    const hour = useRef(time.getHours());
    const min = useRef(time.getMinutes());
    const allowHourConversion = useRef(false);
    const [hourFocused, setHourFocused] = useState(false);

    useEffect(() => {
      hour.current = time.getHours();
      min.current = time.getMinutes();
    }, [time])

    const inputClasses = clsx(
      "border border-solid rounded-[10px] text-center font-semibold px-2 py-1.5", {
      "w-9 text-sm": size === "small",
      "w-10 text-base": size === undefined || size === "medium",
      "w-12 text-2xl": size === "large",
    });

    // TODO: Fix deleting chars in mobile moves the cursor wrongly and skip chars
    const onInput = (
      e: React.SyntheticEvent<HTMLInputElement>, 
      prevValue: string, maxValue: number, field: "hour" | "min"
    ) => {
      const nativeEvent = e.nativeEvent as InputEvent; 
      const target = e.currentTarget;
      const input = nativeEvent.data;

      if (nativeEvent.inputType.startsWith("insert")) {
        const isNumber = input?.match(/\d+/);
        if (!isNumber) {
          target.value = prevValue;
          return;
        }

        const selectionStart = target.selectionStart || target.value.length;
        const caretPos = selectionStart - 1;
        
        if (caretPos < target.value.length)
          target.value = target.value.substring(0, caretPos) 
            + input + target.value.substring(caretPos + 2);
           
        target.selectionStart = selectionStart;
        target.selectionEnd = selectionStart;
        const newValue = parseInt(target.value);
        if (newValue > maxValue) {
          target.value = prevValue;
          target.selectionStart = selectionStart - 1;
          target.selectionEnd = selectionStart - 1;
          return;
        }
      }

      const value = parseInt(target.value || "0");
      let valueStr = "";

      switch (field) {
        case "hour":
          allowHourConversion.current = value !== 12;

          if (ampm) {
            let hourCorrected = value;
            if (isAm()) {
              if (hourCorrected === 12) hourCorrected = 0;
            }
            else {
              hourCorrected = value + 12;
              if (hourCorrected === 24) hourCorrected = 12;
            }
            hour.current = hourCorrected;
            valueStr = hourToStr(hourCorrected, ampm, !hourFocused);
            target.value = valueStr;
          }
          else {
            hour.current = value;
            valueStr = hourToStr(value, ampm, !hourFocused);
            target.value = valueStr;
          }
          break;
        case "min":
          valueStr = minToStr(value)
          min.current = value;
          target.value = valueStr;
          break;
      }
    };

    const handleSwitchChange = (e: any, isAm: boolean) => {
        let hours = time.getHours(); 
        if (isAm) hours -= 12;
        else      hours += 12;
        hour.current = hours;
        updateDate();
    };

    const isAm = () => {
        return time ? time.getHours() < 12 : true
    }

    const updateDate = () => {
      const newDate = new Date();
      newDate.setHours(hour.current, min.current, 0, 0);
      onChange && onChange(newDate);
    };

    const onInputFocus = (e: React.FocusEvent<HTMLInputElement, Element>) => {
      e.target.select();
    };

    return (
      <span 
        className={"inline-grid grid-rows-[minmax(0,_1fr)_auto] grid-flow-col-dense items-center " + (classes?.root || "")}
      >
        <input 
            onInput={e => onInput(e, hourToStr(hour.current, ampm, !hourFocused), ampm ? 12 : 23, "hour")} 
            onChange={updateDate}
            onFocus={e => {
              allowHourConversion.current = false;
              onInputFocus(e); 
              setHourFocused(true);
            }}
            onBlur={e => {
              setHourFocused(false)
              onBlur && onBlur(e);
            }}
            value={time.getTime() === 0 
              ? "00" 
              : hourToStr(time.getHours(), ampm, !hourFocused, allowHourConversion.current)
            }
            className={inputClasses + " " + (classes?.hourInput || "")}
            disabled={disabled}
            ref={hourInputRef}
        />
        <span className={classes?.hourLabel}>{hourLabel}</span>
        <span className={"font-bold mx-2 " + " " + (classes?.separator || "")}>:</span>
        <span></span>
        <input 
            onInput={e => onInput(e, minToStr(min.current), 59, "min")} 
            onChange={updateDate}
            onFocus={onInputFocus}
            onBlur={onBlur}
            value={minToStr(time.getMinutes())}
            className={inputClasses + " " + (classes?.minutesInput || "")}
            disabled={disabled}
            ref={minutesInputRef}
        />
        <span className={classes?.minutesLabel}>{minuteLabel}</span>
        {ampm ? (
          <span className="ml-2">
            <TimeSwitch
              {...switchProps}
              isAm={isAm()} 
              onChange={(e, c) => {
                handleSwitchChange && handleSwitchChange(e, c);
                switchProps?.onChange && switchProps?.onChange(e, c);
              }}
              onBlur={e => {
                onBlur && onBlur(e);
                switchProps?.onBlur && switchProps?.onBlur(e);
              }}
              disabled={disabled}
              inputRef={timeSwitchRef}
            />
          </span>
        ) : null}
      </span>
    );
}

export const TimeSwitch: React.FC<TimeSwitchProps> = ({ isAm, sx, ...switchProps }) => {

    return (
      <Switch
        {...switchProps}
        checked={isAm}
        sx={[
          ...(Array.isArray(timeSwitchSx) ? timeSwitchSx : [timeSwitchSx]),
          ...(Array.isArray(sx) ? sx : [sx])
        ]}
      />
    );
}

export const timeSwitchSx: SxProps<Theme> = {
  width: 74,
  height: 37,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    transform: "translateX(-12px) translateY(-51%)",
    top: "50%",
    "&.Mui-checked": {
      transform: "translateX(22px) translateY(-51%)",
    },
  },
  "&:before": {
    content: '"AM"',
    left: 10,
  },
  "&:after": {
    content: '"PM"',
    right: 10,
  },
  "&:after, &:before": {
    fontWeight: 600,
    color: "#000",
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
  },
  "& .MuiSwitch-track": {
    width: "100%",
    height: "100%",
    borderRadius: 18.5,
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 30,
    height: 30,
    marginLeft: "8px",
  },
}

function minToStr(min: number) {
  return min.toString().padStart(2, "00");
}

function hourToStr(hour: number, ampm?: boolean, convert0to12?: boolean, allowConversion?: boolean) {
  if (ampm) {
    const hourTruncated = hour % 12;
    if (hour === 0 || (hourTruncated) === 0) {
      if (convert0to12)
        return "12"
      else {
        if (allowConversion) return "00";
        else      return "12";
      }
    }
    else
      return (hourTruncated).toString().padStart(2, "00");
  }

  return hour.toString().padStart(2, "00");
}
import {
  DatePickerType,
  DatePicker as _MantineDatePicker,
  type DatePickerProps as _DatePickerProps,
} from "@mantine/dates";
import { FieldValues } from "react-hook-form";

import type { BaseInputProps } from "../types";
import _DatePicker from "../hook-form/dates/DatePicker";

export type DatePickerProps<
  Type extends DatePickerType = "default",
  TFieldValues extends FieldValues = FieldValues,
> = BaseInputProps<TFieldValues, _DatePickerProps<Type>>;

const DatePicker = <
  Type extends DatePickerType = "default",
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  ...props
}: DatePickerProps<Type, TFieldValues>) => {
  if (control && name)
    return <_DatePicker name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} {...props} />;
  else
    return <_MantineDatePicker {...props} />;
}

export default DatePicker;

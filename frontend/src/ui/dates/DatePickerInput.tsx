import {
  DatePickerType,
  DatePickerInput as _MantineDatePickerInput,
  type DatePickerInputProps as _DatePickerInputProps,
} from "@mantine/dates";
import { FieldValues } from "react-hook-form";

import type { BaseInputProps } from "../types";
import _DatePickerInput from "../hook-form/dates/DatePickerInput";

export type DatePickerInputProps<
  Type extends DatePickerType = "default",
  TFieldValues extends FieldValues = FieldValues,
> = BaseInputProps<TFieldValues, _DatePickerInputProps<Type>>;

const DatePickerInput = <
  Type extends DatePickerType = "default",
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  ...props
}: DatePickerInputProps<Type, TFieldValues>) => {
  if (control && name)
    return <_DatePickerInput name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} {...props} />;
  else
    return <_MantineDatePickerInput name={name} {...props} />;
}

export default DatePickerInput;

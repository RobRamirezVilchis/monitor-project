import {
  DatePickerType,
  MonthPickerInput as _MantineMonthPickerInput,
  type MonthPickerInputProps as _MonthPickerInputProps,
} from "@mantine/dates";
import { FieldValues } from "react-hook-form";

import type { BaseInputProps } from "../types";
import _MonthPickerInput from "../hook-form/dates/MonthPickerInput";

export type MonthPickerInputProps<
  Type extends DatePickerType = "default",
  TFieldValues extends FieldValues = FieldValues,
> = BaseInputProps<TFieldValues, _MonthPickerInputProps<Type>>;

const MonthPickerInput = <
  Type extends DatePickerType = "default",
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  ...props
}: MonthPickerInputProps<Type, TFieldValues>) => {
  if (control && name)
    return <_MonthPickerInput name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} {...props} />;
  else
    return <_MantineMonthPickerInput name={name} {...props} />;
}

export default MonthPickerInput;

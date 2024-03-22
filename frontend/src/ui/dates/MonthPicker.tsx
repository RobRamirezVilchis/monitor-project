import {
  DatePickerType,
  MonthPicker as _MantineMonthPicker,
  type MonthPickerProps as _MonthPickerProps,
} from "@mantine/dates";
import { FieldValues } from "react-hook-form";

import type { BaseInputProps } from "../types";
import _MonthPicker from "../hook-form/dates/MonthPicker";

export type MonthPickerProps<
  Type extends DatePickerType = "default",
  TFieldValues extends FieldValues = FieldValues,
> = BaseInputProps<TFieldValues, _MonthPickerProps<Type>>;

const MonthPicker = <
  Type extends DatePickerType = "default",
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  ...props
}: MonthPickerProps<Type, TFieldValues>) => {
  if (control && name)
    return <_MonthPicker name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} {...props} />;
  else
    return <_MantineMonthPicker {...props} />;
}

export default MonthPicker;

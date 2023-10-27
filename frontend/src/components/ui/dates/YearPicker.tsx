import {
  DatePickerType,
  YearPicker as _MantineYearPicker,
  type YearPickerProps as _YearPickerProps,
} from "@mantine/dates";
import { FieldValues } from "react-hook-form";

import type { BaseInputProps } from "../types";
import _YearPicker from "../hook-form/dates/YearPicker";

export type YearPickerProps<
  Type extends DatePickerType = "default",
  TFieldValues extends FieldValues = FieldValues,
> = BaseInputProps<TFieldValues, _YearPickerProps<Type>>;

const YearPicker = <
  Type extends DatePickerType = "default",
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  ...props
}: YearPickerProps<Type, TFieldValues>) => {
  if (control && name)
    return <_YearPicker name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} {...props} />;
  else
    return <_MantineYearPicker {...props} />;
}

export default YearPicker;

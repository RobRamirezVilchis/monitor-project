import {
  DatePickerType,
  YearPickerInput as _MantineYearPickerInput,
  type YearPickerInputProps as _YearPickerInputProps,
} from "@mantine/dates";
import { FieldValues } from "react-hook-form";

import type { BaseInputProps } from "../types";
import _YearPickerInput from "../hook-form/dates/YearPickerInput";

export type YearPickerInputProps<
  Type extends DatePickerType = "default",
  TFieldValues extends FieldValues = FieldValues,
> = BaseInputProps<TFieldValues, _YearPickerInputProps<Type>>;

const YearPickerInput = <
  Type extends DatePickerType = "default",
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  ...props
}: YearPickerInputProps<Type, TFieldValues>) => {
  if (control && name)
    return <_YearPickerInput name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} {...props} />;
  else
    return <_MantineYearPickerInput name={name} {...props} />;
}

export default YearPickerInput;

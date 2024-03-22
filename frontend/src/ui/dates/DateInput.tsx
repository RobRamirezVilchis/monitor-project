import {
  DateInput as _MantineDateInput,
  type DateInputProps as _DateInputProps,
} from "@mantine/dates";
import { FieldValues } from "react-hook-form";

import type { BaseInputProps } from "../types";
import _DateInput from "../hook-form/dates/DateInput";

export type DateInputProps<
  TFieldValues extends FieldValues = FieldValues,
> = BaseInputProps<TFieldValues, _DateInputProps>;

const DateInput = <
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  ...props
}: DateInputProps<TFieldValues>) => {
  if (control && name)
    return <_DateInput name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} {...props} />;
  else
    return <_MantineDateInput name={name} {...props} />;
}

export default DateInput;

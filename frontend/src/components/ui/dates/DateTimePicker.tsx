import {
  DateTimePicker as _MantineDateTimePicker,
  type DateTimePickerProps as _DateTimePickerProps,
} from "@mantine/dates";
import { FieldValues } from "react-hook-form";

import type { BaseInputProps } from "../types";
import _DateTimePicker from "../hook-form/dates/DateTimePicker";

export type DateTimePickerProps<
  TFieldValues extends FieldValues = FieldValues,
> = BaseInputProps<TFieldValues, _DateTimePickerProps>;

const DateTimePicker = <
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  ...props
}: DateTimePickerProps<TFieldValues>) => {
  if (control && name)
    return <_DateTimePicker name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} {...props} />;
  else
    return <_MantineDateTimePicker name={name} {...props} />;
}

export default DateTimePicker;

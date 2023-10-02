import {
  TimeInput as _MantineTimeInput,
  type TimeInputProps as _TimeInputProps,
} from "@mantine/dates";
import { FieldValues } from "react-hook-form";

import type { BaseInputProps } from "../types";
import _TimeInput from "../hook-form/dates/TimeInput";

export type TimeInputProps<
  TFieldValues extends FieldValues = FieldValues,
> = BaseInputProps<TFieldValues, _TimeInputProps>;

const TimeInput = <
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  ...props
}: TimeInputProps<TFieldValues>) => {
  if (control && name)
    return <_TimeInput name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} {...props} />;
  else
    return <_MantineTimeInput name={name} {...props} />;
}

export default TimeInput;

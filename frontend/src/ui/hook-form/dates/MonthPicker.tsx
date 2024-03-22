import {
  DatePickerType,
  MonthPicker as _MonthPicker,
  type MonthPickerProps as _MonthPickerProps,
} from "@mantine/dates";
import { FieldValues, useController } from "react-hook-form";
import { mergeRefs } from "@mantine/hooks";

import { FormInputProps } from "@/ui/hook-form/base";

export type MonthPickerProps<
  Type extends DatePickerType = "default",
  TFieldValues extends FieldValues = FieldValues,
> = FormInputProps<TFieldValues, _MonthPickerProps<Type>>;

const MonthPicker = <
  Type extends DatePickerType = "default",
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  defaultValue,
  onChange: _onChange,
  onBlur: _onBlur,
  inputRef,
  ...props
}: MonthPickerProps<Type, TFieldValues>) => {
  const {
    field: { value, onChange, onBlur, ref, ...field },
  } = useController<TFieldValues>({
    name: name ?? "" as any,
    control,
    rules,
    shouldUnregister,
    defaultValue: defaultValue as any,
  });

  return (
    <_MonthPicker<Type>
      {...field}
      {...props}
      value={value}
      onChange={(...args) => {
        onChange(...args);
        _onChange?.(...args);
      }}
      onBlur={(...args) => {
        onBlur();
        _onBlur?.(...args);
      }}
      ref={mergeRefs(ref, inputRef)}
    />
  );
}

export default MonthPicker;

import {
  DatePickerType,
  DatePicker as _DatePicker,
  type DatePickerProps as _DatePickerProps,
} from "@mantine/dates";
import { FieldValues, useController } from "react-hook-form";
import { mergeRefs } from "@mantine/hooks";

import { FormInputProps } from "@/components/ui/hook-form/base";

export type DatePickerProps<
  Type extends DatePickerType = "default",
  TFieldValues extends FieldValues = FieldValues,
> = FormInputProps<TFieldValues, _DatePickerProps<Type>>;

const DatePicker = <
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
}: DatePickerProps<Type, TFieldValues>) => {
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
    <_DatePicker<Type>
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

export default DatePicker;

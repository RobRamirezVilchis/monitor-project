import {
  DatePickerType,
  YearPickerInput as _YearPickerInput,
  type YearPickerInputProps as _YearPickerInputProps,
} from "@mantine/dates";
import { FieldValues, useController } from "react-hook-form";
import { mergeRefs } from "@mantine/hooks";

import { FormInputProps } from "@/ui/hook-form/base";

export type YearPickerInputProps<
  Type extends DatePickerType = "default",
  TFieldValues extends FieldValues = FieldValues,
> = FormInputProps<TFieldValues, _YearPickerInputProps<Type>>;

const YearPickerInput = <
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
}: YearPickerInputProps<Type, TFieldValues>) => {
  const {
    field: { value, onChange, onBlur, ref, ...field },
    fieldState,
  } = useController<TFieldValues>({
    name: name ?? "" as any,
    control,
    rules,
    shouldUnregister,
    defaultValue: defaultValue as any,
  });

  return (
    <_YearPickerInput<Type>
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
      error={props.error || fieldState.error?.message}
    />
  );
}

export default YearPickerInput;

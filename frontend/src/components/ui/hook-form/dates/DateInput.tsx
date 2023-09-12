import {
  DateInput as _DateInput,
  type DateInputProps as _DateInputProps,
} from "@mantine/dates";
import { FieldValues, useController } from "react-hook-form";
import { mergeRefs } from "@mantine/hooks";

import { FormInputProps } from "@/components/ui/hook-form/base";

export type DateInputProps<
  TFieldValues extends FieldValues = FieldValues,
> = FormInputProps<TFieldValues, _DateInputProps>;

const DateInput = <
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
}: DateInputProps<TFieldValues>) => {
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
    <_DateInput
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
      error={fieldState.error?.message}
    />
  );
}

export default DateInput;

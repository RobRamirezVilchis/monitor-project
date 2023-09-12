import { 
  Select as _Select,
  type SelectProps as _SelectProps,
} from "@mantine/core";
import { FieldValues, useController } from "react-hook-form";
import { mergeRefs } from "@mantine/hooks";

import { FormInputProps } from "@/components/ui/hook-form/base";

export type SelectProps<
  TFieldValues extends FieldValues = FieldValues,
> = FormInputProps<TFieldValues, _SelectProps>;

const Select = <
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
}: SelectProps<TFieldValues>) => {
  const {
    field: { value, onChange, onBlur, ref, ...field },
    fieldState,
  } = useController<TFieldValues>({ 
    name,
    control,
    rules,
    shouldUnregister,
    defaultValue,
  });

  return (
    <_Select
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

export default Select;

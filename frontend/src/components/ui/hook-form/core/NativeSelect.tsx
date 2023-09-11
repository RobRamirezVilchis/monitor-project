import { 
  NativeSelect as _NativeSelect,
  type NativeSelectProps as _NativeSelectProps,
} from "@mantine/core";
import { FieldValues, useController } from "react-hook-form";

import { FormInputProps } from "@/components/ui/hook-form/base";

export type NativeSelectProps<
  TFieldValues extends FieldValues = FieldValues,
> = FormInputProps<TFieldValues, _NativeSelectProps, HTMLSelectElement>;

const NativeSelect = <
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  defaultValue,
  onChange: _onChange,
  onBlur: _onBlur,
  ref: _ref,
  ...props
}: NativeSelectProps<TFieldValues>) => {
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
    <_NativeSelect
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
      ref={((el: HTMLSelectElement) => ref?.(el)) && _ref}
      error={fieldState.error?.message}
    />
  );
}

export default NativeSelect;

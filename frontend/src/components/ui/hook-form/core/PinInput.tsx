import { 
  PinInput as _PinInput,
  type PinInputProps as _PinInputProps,
} from "@mantine/core";
import { FieldValues, useController } from "react-hook-form";

import { FormInputProps } from "@/components/ui/hook-form/base";

export type PinInputProps<
  TFieldValues extends FieldValues = FieldValues,
> = FormInputProps<TFieldValues, _PinInputProps>;

const PinInput = <
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
}: PinInputProps<TFieldValues>) => {
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
    <_PinInput
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
      ref={((el: HTMLInputElement) => ref?.(el)) && _ref}
      error={!!fieldState.error?.message}
    />
  );
}

export default PinInput;

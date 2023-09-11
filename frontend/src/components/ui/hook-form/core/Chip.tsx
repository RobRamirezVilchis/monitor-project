import { 
  Chip as _Chip,
  type ChipProps as _ChipProps,
} from "@mantine/core";
import { FieldValues, useController } from "react-hook-form";

import { FormInputProps } from "@/components/ui/hook-form/base";

export type ChipProps<
  TFieldValues extends FieldValues = FieldValues,
> = FormInputProps<TFieldValues, _ChipProps>;

const Chip = <
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
}: ChipProps<TFieldValues>) => {
  const {
    field: { value, onChange, onBlur, ref, ...field },
  } = useController<TFieldValues>({ 
    name,
    control,
    rules,
    shouldUnregister,
    defaultValue,
  });
  
  return (
    <_Chip
     {...field}
      {...props}
      checked={value}
      onChange={(...args) => {
        onChange(...args);
        _onChange?.(...args);
      }}
      onBlur={(...args) => {
        onBlur();
        _onBlur?.(...args);
      }}
      ref={((el: HTMLInputElement) => ref?.(el)) && _ref}
    />
  )
}

export default Chip;

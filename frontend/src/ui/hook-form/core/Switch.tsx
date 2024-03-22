import { 
  Switch as _Switch,
  type SwitchProps as _SwitchProps,
} from "@mantine/core";
import { FieldValues, useController } from "react-hook-form";
import { mergeRefs } from "@mantine/hooks";

import { FormInputProps } from "@/ui/hook-form/base";

export type SwitchProps<
  TFieldValues extends FieldValues = FieldValues,
> = FormInputProps<TFieldValues, _SwitchProps>;

const Switch = <
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
}: SwitchProps<TFieldValues>) => {
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
    <_Switch
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
      ref={mergeRefs(ref, inputRef)}
      error={props.error || fieldState.error?.message}
    />
  );
}

export default Switch;

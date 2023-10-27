import { 
  InputBase as _InputBase,
  type InputBaseProps as _InputBaseProps,
} from "@mantine/core";
import { PolymorphicComponentProps } from "@mantine/core/lib/core/factory/create-polymorphic-component";
import { mergeRefs } from "@mantine/hooks";
import { FieldValues, useController } from "react-hook-form";

import { FormInputProps } from "@/components/ui/hook-form/base";

export type InputBaseProps<
  TFieldValues extends FieldValues = FieldValues,
> = FormInputProps<TFieldValues, PolymorphicComponentProps<"input", _InputBaseProps>>;

const InputBase = <
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
}: InputBaseProps<TFieldValues>) => {
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
    <_InputBase
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

export default InputBase;

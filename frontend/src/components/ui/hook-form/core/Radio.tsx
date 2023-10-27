import { 
  Radio as _Radio,
  type RadioProps as _RadioProps,
  type RadioGroupProps as _RadioGroupProps,
  type GroupProps as _GroupProps,
} from "@mantine/core";
import { FieldValues, useController } from "react-hook-form";
import { mergeRefs } from "@mantine/hooks";

import { FormInputProps } from "@/components/ui/hook-form/base";

export type RadioProps<
  TFieldValues extends FieldValues = FieldValues,
> = FormInputProps<TFieldValues, _RadioProps>;

const Radio = <
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
}: RadioProps<TFieldValues>) => {
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
    <_Radio
      {...field}
      {...props}
      checked={value}
      onChange={(...args) => {
        onChange(args[0].currentTarget.checked);
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

export type RadioGroupProps<
  TFieldValues extends FieldValues = FieldValues,
> = FormInputProps<TFieldValues, _RadioGroupProps>;

export const RadioGroup = <
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
}: RadioGroupProps<TFieldValues>) => {
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
    <_Radio.Group
      {...field}
      {...props as any}
      value={value}
      onChange={(...args) => {
        onChange(...args);
        _onChange?.(...args);
      }}
      onBlur={(...args) => {
        onBlur();
        _onBlur?.(...args);
      }}
      ref={((el: HTMLInputElement) => ref?.(el)) && inputRef}
      error={props.error || fieldState.error?.message}
    />
  );
}

export default Object.assign(Radio, {
  Group: RadioGroup,
});

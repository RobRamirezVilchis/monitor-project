import { 
  IMaskInput as _IMaskInput,
  type IMaskInputProps as _IMaskInputProps,
} from "@/components/ui/base/core";
import { mergeRefs } from "@mantine/hooks";
import { FieldValues, useController } from "react-hook-form";

import { FormInputProps } from "@/components/ui/hook-form/base";

export type IMaskInputProps<
  TFieldValues extends FieldValues = FieldValues,
> = FormInputProps<TFieldValues> & _IMaskInputProps;

const IMaskInput = <
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  defaultValue,
  onAccept,
  onBlur: _onBlur,
  inputRef,
  ...props
}: IMaskInputProps<TFieldValues>) => {
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
    <_IMaskInput
      {...field}
      {...props as any}
      value={value}
      onBlur={(...args) => {
        onBlur();
        _onBlur?.(...args);
      }}
      ref={mergeRefs(ref, inputRef)}
      error={props.error || fieldState.error?.message}
      onAccept={(value: any, maskRef: any, e: any) => {
        onChange(value);
        onAccept?.(value, maskRef, e);
      }}
    />
  );
}

export default IMaskInput;

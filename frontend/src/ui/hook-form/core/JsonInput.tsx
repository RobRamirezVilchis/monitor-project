import { FieldValues, useController } from "react-hook-form";
import { 
  JsonInput as _JsonInput,
  type JsonInputProps as _JsonInputProps,
} from "@mantine/core";
import { mergeRefs } from "@mantine/hooks";

import { FormInputProps } from "@/ui/hook-form/base";

export type JsonInputProps<
  TFieldValues extends FieldValues = FieldValues,
> = FormInputProps<TFieldValues, _JsonInputProps, HTMLTextAreaElement>;

const JsonInput = <
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
}: JsonInputProps<TFieldValues>) => {
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
    <_JsonInput
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

export default JsonInput;

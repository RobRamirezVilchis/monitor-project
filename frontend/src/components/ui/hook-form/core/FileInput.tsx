import { 
  FileInput as _FileInput,
  type FileInputProps as _FileInputProps,
} from "@mantine/core";
import { FieldValues, useController } from "react-hook-form";

import { FormInputProps } from "@/components/ui/hook-form/base";

export type FileInputProps<
  Multiple extends boolean = false,
  TFieldValues extends FieldValues = FieldValues,
> = FormInputProps<TFieldValues, _FileInputProps<Multiple>, HTMLButtonElement>;

const FileInput = <
  Multiple extends boolean = false,
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
}: FileInputProps<Multiple, TFieldValues>) => {
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
    <_FileInput<Multiple>
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
      ref={((el: HTMLButtonElement) => ref?.(el)) && _ref}
      error={fieldState.error?.message}
    />
  );
}

export default FileInput;

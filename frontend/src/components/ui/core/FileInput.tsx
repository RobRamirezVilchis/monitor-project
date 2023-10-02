import { 
  FileInput as _MantineFileInput,
  type FileInputProps as _FileInputProps,
} from "@mantine/core";
import { FieldValues } from "react-hook-form";

import type { BaseInputProps } from "../types";
import _FileInput from "../hook-form/core/FileInput";

export type FileInputProps<
  Multiple extends boolean = false,
  TFieldValues extends FieldValues = FieldValues,
> = BaseInputProps<TFieldValues, _FileInputProps<Multiple>, HTMLButtonElement>;

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
  inputRef,
  ...props
}: FileInputProps<Multiple, TFieldValues>) => {
  if (control && name)
    return <_FileInput name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} {...props} />;
  else
    return <_MantineFileInput name={name} {...props} />;
}

export default FileInput;

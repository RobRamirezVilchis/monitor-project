import { 
  TextInput as _MantineTextInput,
  type TextInputProps as _TextInputProps,
} from "@mantine/core";
import { FieldValues } from "react-hook-form";

import type { BaseInputProps } from "../types";
import _TextInput from "../hook-form/core/TextInput";

export type TextInputProps<
  TFieldValues extends FieldValues = FieldValues,
> = BaseInputProps<TFieldValues, _TextInputProps>;

const TextInput = <
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  ...props
}: TextInputProps<TFieldValues>) => {
  if (control && name)
    return <_TextInput name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} {...props} />;
  else
    return <_MantineTextInput name={name} {...props} />;
}

export default TextInput;

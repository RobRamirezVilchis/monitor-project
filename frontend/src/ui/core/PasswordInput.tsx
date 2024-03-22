import { 
  PasswordInput as _MantinePasswordInput,
  type PasswordInputProps as _PasswordInputProps,
} from "@mantine/core";
import { FieldValues } from "react-hook-form";

import type { BaseInputProps } from "../types";
import _PasswordInput from "../hook-form/core/PasswordInput";

export type PasswordInputProps<
  TFieldValues extends FieldValues = FieldValues,
> = BaseInputProps<TFieldValues, _PasswordInputProps>;

const PasswordInput = <
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  inputRef,
  ...props
}: PasswordInputProps<TFieldValues>) => {
  if (control && name)
    return <_PasswordInput name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} inputRef={inputRef} {...props} />;
  else
    return <_MantinePasswordInput name={name} ref={inputRef} {...props} />;
}

export default PasswordInput;

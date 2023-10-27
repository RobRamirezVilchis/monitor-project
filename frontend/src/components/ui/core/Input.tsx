import { 
  Input as _MantineInput,
  type InputProps as _InputProps,
} from "@mantine/core";
import { PolymorphicComponentProps } from "@mantine/core/lib/core/factory/create-polymorphic-component";
import { FieldValues } from "react-hook-form";

import type { BaseInputProps } from "../types";
import _Input from "../hook-form/core/Input";

export type InputProps<
  TFieldValues extends FieldValues = FieldValues,
> = BaseInputProps<TFieldValues, PolymorphicComponentProps<"input", _InputProps>>;

const Input = <
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  inputRef,
  ...props
}: InputProps<TFieldValues>) => {
  if (control && name)
    return <_Input name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} inputRef={inputRef} {...props} />;
  else
    return <_MantineInput name={name} ref={inputRef} {...props} />;
}

export default Input;

import { 
  InputBase as _MantineInputBase,
  type InputBaseProps as _InputBaseProps,
} from "@mantine/core";
import { PolymorphicComponentProps } from "@mantine/core/lib/core/factory/create-polymorphic-component";
import { FieldValues } from "react-hook-form";

import type { BaseInputProps } from "../types";
import _InputBase from "../hook-form/core/InputBase";

export type InputBaseProps<
  TFieldValues extends FieldValues = FieldValues,
> = BaseInputProps<TFieldValues, PolymorphicComponentProps<"input", _InputBaseProps>>;

const InputBase = <
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  inputRef,
  ...props
}: InputBaseProps<TFieldValues>) => {
  if (control && name)
    return <_InputBase name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} inputRef={inputRef} {...props} />;
  else
    return <_MantineInputBase name={name} ref={inputRef} {...props} />;
}

export default InputBase;

import { 
  Textarea as _MantineTextarea,
  type TextareaProps as _TexaAreaProps,
} from "@mantine/core";
import { FieldValues } from "react-hook-form";

import type { BaseInputProps } from "../types";
import _Textarea from "../hook-form/core/Textarea";

export type TextareaProps<
  TFieldValues extends FieldValues = FieldValues,
> = BaseInputProps<TFieldValues, _TexaAreaProps, HTMLTextAreaElement>;

const Textarea = <
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  inputRef,
  ...props
}: TextareaProps<TFieldValues>) => {
  if (control && name)
    return <_Textarea name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} inputRef={inputRef} {...props} />;
  else
    return <_MantineTextarea name={name} ref={inputRef} {...props} />;
}

export default Textarea;

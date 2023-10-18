import { FieldValues } from "react-hook-form";
import { 
  JsonInput as _MantineJsonInput,
  type JsonInputProps as _JsonInputProps,
} from "@mantine/core";

import type { BaseInputProps } from "../types";
import _JsonInput from "../hook-form/core/JsonInput";

export type JsonInputProps<
  TFieldValues extends FieldValues = FieldValues,
> = BaseInputProps<TFieldValues, _JsonInputProps, HTMLTextAreaElement>;

const JsonInput = <
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  inputRef,
  ...props
}: JsonInputProps<TFieldValues>) => {
  if (control && name)
    return <_JsonInput name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} inputRef={inputRef} {...props} />;
  else
    return <_MantineJsonInput name={name} ref={inputRef} {...props} />;
}

export default JsonInput;

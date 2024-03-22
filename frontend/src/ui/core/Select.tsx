import { 
  Select as _MantineSelect,
  type SelectProps as _SelectProps,
} from "@mantine/core";
import { FieldValues } from "react-hook-form";

import type { BaseInputProps } from "../types";
import _Select from "../hook-form/core/Select";

export type SelectProps<
  TFieldValues extends FieldValues = FieldValues,
> = BaseInputProps<TFieldValues, _SelectProps>;

const Select = <
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  inputRef,
  ...props
}: SelectProps<TFieldValues>) => {
  if (control && name)
    return <_Select name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} inputRef={inputRef} {...props} />;
  else
    return <_MantineSelect name={name} ref={inputRef} {...props} />;
}

export default Select;

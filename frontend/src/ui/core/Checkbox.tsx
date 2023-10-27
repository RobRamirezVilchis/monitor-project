import { 
  Checkbox as _MantineCheckbox,
  type CheckboxProps as _CheckboxProps,
} from "@mantine/core";
import { FieldValues } from "react-hook-form";

import _Checkbox from "../hook-form/core/Checkbox";
import type { BaseInputProps } from "../types";

export type CheckboxProps<
  TFieldValues extends FieldValues = FieldValues,
> = BaseInputProps<TFieldValues, _CheckboxProps>;

const Checkbox = <
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  inputRef,
  ...props
}: CheckboxProps<TFieldValues>) => {
  if (control && name)
    return <_Checkbox name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} inputRef={inputRef} {...props} />;
  else
    return <_MantineCheckbox name={name} ref={inputRef} {...props} />;
}

export default Checkbox;

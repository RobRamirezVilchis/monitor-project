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
  ...props
}: CheckboxProps<TFieldValues>) => {
  if (control && name)
    return <_Checkbox name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} {...props} />;
  else
    return <_MantineCheckbox name={name} {...props} />;
}

export default Checkbox;

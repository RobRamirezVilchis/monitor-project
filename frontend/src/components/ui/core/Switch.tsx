import { 
  Switch as _MantineSwitch,
  type SwitchProps as _SwitchProps,
} from "@mantine/core";
import { FieldValues } from "react-hook-form";

import type { BaseInputProps } from "../types";
import _Switch from "../hook-form/core/Switch";

export type SwitchProps<
  TFieldValues extends FieldValues = FieldValues,
> = BaseInputProps<TFieldValues, _SwitchProps>;

const Switch = <
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  ...props
}: SwitchProps<TFieldValues>) => {
  if (control && name)
    return <_Switch name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} {...props} />;
  else
    return <_MantineSwitch name={name} {...props} />;
}

export default Switch;

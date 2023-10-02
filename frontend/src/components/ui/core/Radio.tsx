import { 
  Radio as _MantineRadio,
  type RadioProps as _RadioProps,
  type RadioGroupProps as _RadioGroupProps,
  type GroupProps as _GroupProps,
} from "@mantine/core";
import { FieldValues } from "react-hook-form";

import _Radio from "../hook-form/core/Radio";
import type { BaseInputProps } from "../types";

export type RadioProps<
  TFieldValues extends FieldValues = FieldValues,
> = BaseInputProps<TFieldValues, _RadioProps>;

const Radio = <
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  ...props
}: RadioProps<TFieldValues>) => {
  if (control && name)
    return <_Radio name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} {...props} />;
  else
    return <_MantineRadio name={name} {...props} />;
}

export type RadioGroupProps<
  TFieldValues extends FieldValues = FieldValues,
> = BaseInputProps<TFieldValues, _RadioGroupProps>;

export const RadioGroup = <
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  ...props
}: RadioGroupProps<TFieldValues>) => {
  if (control && name)
    return <_Radio.Group name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} {...props} />;
  else
    return <_MantineRadio.Group name={name} {...props} />;
}

export default Object.assign(Radio, {
  Group: RadioGroup,
});

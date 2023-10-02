import {
  ColorInput as _MantineColorInput,
  type ColorInputProps as _ColorInputProps,
} from "@mantine/core";
import { FieldValues } from "react-hook-form";

import type { BaseInputProps } from "../types";
import _ColorInput from "../hook-form/core/ColorInput";

export type ColorInputProps<TFieldValues extends FieldValues = FieldValues> =
  BaseInputProps<TFieldValues, _ColorInputProps>;

const ColorInput = <TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  rules,
  shouldUnregister,
  ...props
}: ColorInputProps<TFieldValues>) => {
  if (control && name)
    return <_ColorInput name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} {...props} />;
  else
    return <_MantineColorInput name={name} {...props} />;
};

export default ColorInput;

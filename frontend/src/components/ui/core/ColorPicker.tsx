import {
  ColorPicker as _MantineColorPicker,
  type ColorPickerProps as _ColorPickerProps,
} from "@mantine/core";
import { FieldValues } from "react-hook-form";

import type { BaseInputProps } from "../types";
import _ColorPicker from "../hook-form/core/ColorPicker";

export type ColorPickerProps<TFieldValues extends FieldValues = FieldValues> =
  BaseInputProps<TFieldValues, _ColorPickerProps>;

const ColorPicker = <TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  rules,
  shouldUnregister,
  ...props
}: ColorPickerProps<TFieldValues>) => {
  if (control && name)
    return <_ColorPicker name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} {...props} />;
  else
    return <_MantineColorPicker {...props} />;
};

export default ColorPicker;

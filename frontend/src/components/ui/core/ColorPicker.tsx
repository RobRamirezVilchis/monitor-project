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
  inputRef,
  ...props
}: ColorPickerProps<TFieldValues>) => {
  if (control && name)
    return <_ColorPicker name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} inputRef={inputRef} {...props} />;
  else
    return <_MantineColorPicker ref={inputRef} {...props} />;
};

export default ColorPicker;

import {
  ColorPicker as _ColorPicker,
  type ColorPickerProps as _ColorPickerProps,
} from "@mantine/core";
import { FieldValues, useController } from "react-hook-form";
import { mergeRefs } from "@mantine/hooks";

import { FormInputProps } from "@/ui/hook-form/base";

export type ColorPickerProps<TFieldValues extends FieldValues = FieldValues> =
  FormInputProps<TFieldValues, _ColorPickerProps>;

const ColorPicker = <TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  rules,
  shouldUnregister,
  defaultValue,
  onChange: _onChange,
  onBlur: _onBlur,
  inputRef,
  ...props
}: ColorPickerProps<TFieldValues>) => {
  const {
    field: { value, onChange, onBlur, ref, ...field },
  } = useController<TFieldValues>({
    name,
    control,
    rules,
    shouldUnregister,
    defaultValue,
  });

  return (
    <_ColorPicker
      {...field}
      {...props}
      value={value}
      onChange={(...args) => {
        onChange(...args);
        _onChange?.(...args);
      }}
      onBlur={(...args) => {
        onBlur();
        _onBlur?.(...args);
      }}
      ref={mergeRefs(ref, inputRef)}
    />
  );
}

export default ColorPicker;

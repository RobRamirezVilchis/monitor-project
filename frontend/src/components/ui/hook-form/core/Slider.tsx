import { 
  Slider as _Slider,
  type SliderProps as _SliderProps,
} from "@mantine/core";
import { FieldValues, useController } from "react-hook-form";

import { FormInputProps } from "@/components/ui/hook-form/base";

export type SliderProps<
  TFieldValues extends FieldValues = FieldValues,
> = FormInputProps<TFieldValues, _SliderProps, HTMLDivElement>;

const Slider = <
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  defaultValue,
  onChange: _onChange,
  onBlur: _onBlur,
  ref: _ref,
  ...props
}: SliderProps<TFieldValues>) => {
  const {
    field: { value, onChange, onBlur, ref, ...field },
  } = useController<TFieldValues>({ 
    name: name ?? "" as any,
    control,
    rules,
    shouldUnregister,
    defaultValue: defaultValue as any,
  });

  return (
    <_Slider
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
      ref={((el: HTMLDivElement) => ref?.(el)) && _ref}
    />
  );
}

export default Slider;

import { 
  Slider as _MantineSlider,
  type SliderProps as _SliderProps,
} from "@mantine/core";
import { FieldValues } from "react-hook-form";

import type { BaseInputProps } from "../types";
import _Slider from "../hook-form/core/Slider";

export type SliderProps<
  TFieldValues extends FieldValues = FieldValues,
> = BaseInputProps<TFieldValues, _SliderProps, HTMLDivElement>;

const Slider = <
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  ...props
}: SliderProps<TFieldValues>) => {
  if (control && name)
    return <_Slider name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} {...props} />;
  else
    return <_MantineSlider name={name} {...props} />;
}

export default Slider;

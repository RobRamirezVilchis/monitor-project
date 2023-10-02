import { 
  Rating as _MantineRating,
  type RatingProps as _RatingProps,
} from "@mantine/core";
import { FieldValues } from "react-hook-form";

import type { BaseInputProps } from "../types";
import _Rating from "../hook-form/core/Rating";

export type RatingProps<
  TFieldValues extends FieldValues = FieldValues,
> = BaseInputProps<TFieldValues, _RatingProps, HTMLDivElement>;

const Rating = <
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  defaultValue,
  onChange: _onChange,
  onBlur: _onBlur,
  inputRef,
  ...props
}: RatingProps<TFieldValues>) => {
  if (control && name)
    return <_Rating name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} {...props} />;
  else
    return <_MantineRating name={name} {...props} />;
}

export default Rating;

import { FieldValues } from "react-hook-form";

import type { BaseInputProps } from "../types";
import _HFNumericFormatInput, { type NumericFormatInputExtraProps } from "../hook-form/core/NumericFormatInput";
import _NumericFormatInput, { 
  type NumericFormatInputProps as _NumericFormatInputProps,
} from "@/ui/base/core/NumericFormatInput";

export type NumericFormatInputProps<
  C = "input",
  TFieldValues extends FieldValues = FieldValues,
> = BaseInputProps<TFieldValues> 
  & _NumericFormatInputProps<C>
  & NumericFormatInputExtraProps;

const NumericFormatInput = <
  C = "input",
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  ...props
}: NumericFormatInputProps<C, TFieldValues>) => {
  if (control && name)
    return <_HFNumericFormatInput name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} {...props as any} />;
  else
    return <_NumericFormatInput name={name} {...props as any} />;
}

export default NumericFormatInput;

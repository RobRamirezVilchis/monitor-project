import { FieldValues } from "react-hook-form";

import type { BaseInputProps } from "../types";
import _HFNumberFormatBaseInput, { type NumberFormatBaseInputExtraProps } from "../hook-form/core/NumberFormatBaseInput";
import _NumberFormatBaseInput, { 
  type NumberFormatBaseInputProps as _NumberFormatBaseInputProps,
} from "@/ui/base/core/NumberFormatBaseInput";

export type NumberFormatBaseInputProps<
  C = "input",
  TFieldValues extends FieldValues = FieldValues,
> = BaseInputProps<TFieldValues> 
  & _NumberFormatBaseInputProps<C>
  & NumberFormatBaseInputExtraProps;

const NumberFormatBaseInput = <
  C = "input",
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  ...props
}: NumberFormatBaseInputProps<C, TFieldValues>) => {
  if (control && name)
    return <_HFNumberFormatBaseInput name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} {...props as any} />;
  else
    return <_NumberFormatBaseInput name={name} {...props as any} />;
}

export default NumberFormatBaseInput;

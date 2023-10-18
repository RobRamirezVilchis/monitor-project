import { FieldValues } from "react-hook-form";

import type { BaseInputProps } from "../types";
import _HFIMaskInput from "../hook-form/core/IMaskInput";
import _IMaskInput, { 
  type IMaskInputProps as _IMaskInputProps,
} from "@/components/ui/base/core/IMaskInput";

export type IMaskInputProps<
  TFieldValues extends FieldValues = FieldValues,
> = BaseInputProps<TFieldValues, _IMaskInputProps>;

const IMaskInput = <
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  ...props
}: IMaskInputProps<TFieldValues>) => {
  if (control && name)
    return <_HFIMaskInput name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} {...props as any} />;
  else
    return <_IMaskInput name={name} {...props as any} />;
}

export default IMaskInput;

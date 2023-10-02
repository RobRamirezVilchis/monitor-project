import { 
  NumberInput as _MantineNumberInput,
  type NumberInputProps as _NumberInputProps,
} from "@mantine/core";
import { FieldValues } from "react-hook-form";

import type { BaseInputProps } from "../types";
import _NumberInput from "../hook-form/core/NumberInput";

export type NumberInputProps<
  TFieldValues extends FieldValues = FieldValues,
> = BaseInputProps<TFieldValues, _NumberInputProps>;

const NumberInput = <
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  ...props
}: NumberInputProps<TFieldValues>) => {
  if (control && name)
    return <_NumberInput name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} {...props} />;
  else
    return <_MantineNumberInput name={name} {...props} />;
}

export default NumberInput;

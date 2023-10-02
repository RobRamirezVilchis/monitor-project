import { 
  NativeSelect as _MantineNativeSelect,
  type NativeSelectProps as _NativeSelectProps,
} from "@mantine/core";
import { FieldValues } from "react-hook-form";

import type { BaseInputProps } from "../types";
import _NativeSelect from "../hook-form/core/NativeSelect";

export type NativeSelectProps<
  TFieldValues extends FieldValues = FieldValues,
> = BaseInputProps<TFieldValues, _NativeSelectProps, HTMLSelectElement>;

const NativeSelect = <
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  ...props
}: NativeSelectProps<TFieldValues>) => {
  if (control && name)
    return <_NativeSelect name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} {...props} />;
  else
    return <_MantineNativeSelect name={name} {...props} />;
}

export default NativeSelect;

import { 
  MultiSelect as _MantineMultiSelect,
  type MultiSelectProps as _MultiSelectProps,
} from "@mantine/core";
import { FieldValues } from "react-hook-form";

import _MultiSelect from "../hook-form/core/MultiSelect";
import type { BaseInputProps } from "../types";

export type MultiSelectProps<
  TFieldValues extends FieldValues = FieldValues,
> = BaseInputProps<TFieldValues, _MultiSelectProps>;

const MultiSelect = <
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  ...props
}: MultiSelectProps<TFieldValues>) => {
  if (control && name)
    return <_MultiSelect name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} {...props} />;
  else
    return <_MantineMultiSelect name={name} {...props} />;
}

export default MultiSelect;

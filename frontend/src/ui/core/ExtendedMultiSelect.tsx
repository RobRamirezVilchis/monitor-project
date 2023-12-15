import { FieldValues } from "react-hook-form";

import _BaseExtendedMultiSelect, { 
  type ExtendedMultiSelectProps as _ExtendedMultiSelectProps,
} from "@/ui/base/core/ExtendedMultiSelect";
import _ExtendedMultiSelect from "../hook-form/core/ExtendedMultiSelect";
import type { BaseInputProps } from "../types";

export type ExtendedMultiSelectProps<
  TFieldValues extends FieldValues = FieldValues,
> = BaseInputProps<TFieldValues, _ExtendedMultiSelectProps>;

const ExtendedMultiSelect = <
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  inputRef,
  ...props
}: ExtendedMultiSelectProps<TFieldValues>) => {
  if (control && name)
    return <_ExtendedMultiSelect name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} inputRef={inputRef} {...props} />;
  else
    return <_BaseExtendedMultiSelect name={name} ref={inputRef} {...props} />;
}

export default ExtendedMultiSelect;

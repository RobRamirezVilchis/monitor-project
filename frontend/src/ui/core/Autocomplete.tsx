import { 
  Autocomplete as _MantineAutocomplete,
  type AutocompleteProps as _AutocompleteProps,
} from "@mantine/core";
import { FieldValues } from "react-hook-form";

import _Autocomplete from "../hook-form/core/Autocomplete";
import type { BaseInputProps } from "../types";

export type AutocompleteProps<
  TFieldValues extends FieldValues = FieldValues,
> = BaseInputProps<TFieldValues, _AutocompleteProps>;

const Autocomplete = <
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  inputRef,
  ...props
}: AutocompleteProps<TFieldValues>) => {
  if (control && name)
    return <_Autocomplete name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} {...props} />;
  else
    return <_MantineAutocomplete name={name} ref={inputRef} {...props} />;
}

export default Autocomplete;

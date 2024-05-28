import {
  MultiSelect as _MantineMultiSelect,
  type MultiSelectProps as _MultiSelectProps,
} from "@mantine/core";
import { FieldValues } from "react-hook-form";

import type { BaseInputProps } from "../types";
import _MultiSelect from "../hook-form/core/MultiSelect";

export type MultiSelectProps<TFieldValues extends FieldValues = FieldValues> =
  BaseInputProps<TFieldValues, _MultiSelectProps>;

const MultiSelect = <TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  rules,
  shouldUnregister,
  inputRef,
  ...props
}: MultiSelectProps<TFieldValues>) => {
  if (control && name)
    return (
      <_MultiSelect
        name={name}
        control={control}
        rules={rules}
        shouldUnregister={shouldUnregister}
        inputRef={inputRef}
        {...props}
      />
    );
  else return <_MantineMultiSelect name={name} ref={inputRef} {...props} />;
};

export default MultiSelect;

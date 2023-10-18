import { 
  Chip as _MantineChip,
  type ChipProps as _ChipProps,
} from "@mantine/core";
import { FieldValues } from "react-hook-form";

import type { BaseInputProps } from "../types";
import _Chip from "../hook-form/core/Chip";

export type ChipProps<
  TFieldValues extends FieldValues = FieldValues,
> = BaseInputProps<TFieldValues, _ChipProps>;

const Chip = <
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  inputRef,
  ...props
}: ChipProps<TFieldValues>) => {
  if (control && name)
    return <_Chip name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} inputRef={inputRef} {...props} />;
  else
    return <_MantineChip name={name} ref={inputRef} {...props} />;
}

export default Chip;

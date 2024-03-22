import { 
  PinInput as _MantinePinInput,
  type PinInputProps as _PinInputProps,
} from "@mantine/core";
import { FieldValues } from "react-hook-form";

import type { BaseInputProps } from "../types";
import _PinInput from "../hook-form/core/PinInput";

export type PinInputProps<
  TFieldValues extends FieldValues = FieldValues,
> = BaseInputProps<TFieldValues, _PinInputProps>;

const PinInput = <
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  inputRef,
  ...props
}: PinInputProps<TFieldValues>) => {
  if (control && name)
    return <_PinInput name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} inputRef={inputRef} {...props} />;
  else
    return <_MantinePinInput name={name} ref={inputRef} {...props} />;
}

export default PinInput;

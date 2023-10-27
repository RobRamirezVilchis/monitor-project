import { 
  SegmentedControl as _MantineSegmentedControl,
  type SegmentedControlProps as _SegmentedControlProps,
} from "@mantine/core";
import { FieldValues } from "react-hook-form";

import type { BaseInputProps } from "../types";
import _SegmentedControl from "../hook-form/core/SegmentedControl";

export type SegmentedControlProps<
  TFieldValues extends FieldValues = FieldValues,
> = BaseInputProps<TFieldValues, _SegmentedControlProps, HTMLDivElement>;

const SegmentedControl = <
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  inputRef,
  ...props
}: SegmentedControlProps<TFieldValues>) => {
  if (control && name)
    return <_SegmentedControl name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} inputRef={inputRef} {...props} />;
  else
    return <_MantineSegmentedControl name={name} ref={inputRef} {...props} />;
}

export default SegmentedControl;

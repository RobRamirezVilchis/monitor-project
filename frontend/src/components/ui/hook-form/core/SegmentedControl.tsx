import { 
  SegmentedControl as _SegmentedControl,
  type SegmentedControlProps as _SegmentedControlProps,
} from "@mantine/core";
import { FieldValues, useController } from "react-hook-form";

import { FormInputProps } from "@/components/ui/hook-form/base";

export type SegmentedControlProps<
  TFieldValues extends FieldValues = FieldValues,
> = FormInputProps<TFieldValues, _SegmentedControlProps, HTMLDivElement>;

const SegmentedControl = <
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  defaultValue,
  onChange: _onChange,
  onBlur: _onBlur,
  ref: _ref,
  ...props
}: SegmentedControlProps<TFieldValues>) => {
  const {
    field: { value, onChange, onBlur, ref, ...field },
  } = useController<TFieldValues>({ 
    name: name ?? "" as any,
    control,
    rules,
    shouldUnregister,
    defaultValue: defaultValue as any,
  });

  return (
    <_SegmentedControl
      {...field}
      {...props}
      value={value}
      onChange={(...args) => {
        onChange(...args);
        _onChange?.(...args);
      }}
      onBlur={(...args) => {
        onBlur();
        _onBlur?.(...args);
      }}
      ref={((el: HTMLDivElement) => ref?.(el)) && _ref}
    />
  );
}

export default SegmentedControl;

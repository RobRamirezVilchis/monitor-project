import { FieldValues, useController } from "react-hook-form";
import { mergeRefs } from "@mantine/hooks";

import _ExtendedMultiSelect, { 
  type ExtendedMultiSelectProps as _ExtendedMultiSelectProps,
} from "@/ui/base/core/ExtendedMultiSelect";
import { FormInputProps } from "@/ui/hook-form/base";

export type ExtendedMultiSelectProps<
  TFieldValues extends FieldValues = FieldValues,
> = FormInputProps<TFieldValues, _ExtendedMultiSelectProps>;

const ExtendedMultiSelect = <
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  defaultValue,
  onChange: _onChange,
  onBlur: _onBlur,
  inputRef,
  ...props
}: ExtendedMultiSelectProps<TFieldValues>) => {
  const {
    field: { value, onChange, onBlur, ref, ...field },
    fieldState,
  } = useController<TFieldValues>({ 
    name,
    control,
    rules,
    shouldUnregister,
    defaultValue,
  });

  return (
    <_ExtendedMultiSelect
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
      ref={mergeRefs(ref, inputRef)}
      error={props.error || fieldState.error?.message}
    />
  );
}

export default ExtendedMultiSelect;

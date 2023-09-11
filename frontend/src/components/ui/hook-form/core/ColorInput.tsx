import { 
    ColorInput as _ColorInput,
    type ColorInputProps as _ColorInputProps,
  } from "@mantine/core";
  import { FieldValues, useController } from "react-hook-form";
  
  import { FormInputProps } from "@/components/ui/hook-form/base";
  
  export type ColorInputProps<
    TFieldValues extends FieldValues = FieldValues,
  > = FormInputProps<TFieldValues, _ColorInputProps>;
  
  const ColorInput = <
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
  }: ColorInputProps<TFieldValues>) => {
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
      <_ColorInput
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
        ref={((el: HTMLInputElement) => ref?.(el)) && _ref}
        error={fieldState.error?.message}
      />
    );
  }
  
  export default ColorInput;
  
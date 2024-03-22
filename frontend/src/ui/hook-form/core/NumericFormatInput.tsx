import { 
  NumericFormatInput as _NumericFormatInput,
  type NumericFormatInputProps as _NumericFormatInputProps,
} from "@/ui/base/core";
import { mergeRefs } from "@mantine/hooks";
import { FieldValues, useController } from "react-hook-form";

import { FormInputProps } from "@/ui/hook-form/base";

export interface NumericFormatInputExtraProps {
  /**
   * The format of the value to be submitted to the form.
   * @default "number"
   */
  formValueFormat?: "number" | "string" | "formatted";
}

export type NumericFormatInputProps<
  C = "input",
  TFieldValues extends FieldValues = FieldValues,
> = FormInputProps<TFieldValues> 
  & _NumericFormatInputProps<C> 
  & NumericFormatInputExtraProps;

const NumericFormatInput = <
  C = "input",
  TFieldValues extends FieldValues = FieldValues,
>({
  formValueFormat,

  name,
  control,
  rules,
  shouldUnregister,
  defaultValue,
  onValueChange,
  onBlur: _onBlur,
  inputRef,
  ...props
}: NumericFormatInputProps<C, TFieldValues>) => {
  const {
    field: { value, onChange, onBlur, ref, ...field },
    fieldState,
  } = useController<TFieldValues>({ 
    name: name ?? "" as any,
    control,
    rules,
    shouldUnregister,
    defaultValue: defaultValue as any,
  });

  return (
    <_NumericFormatInput
      {...field}
      {...props as any}
      value={value}
      onBlur={(...args) => {
        onBlur();
        _onBlur?.(...args);
      }}
      ref={mergeRefs(ref, inputRef)}
      error={props.error || fieldState.error?.message}
      onValueChange={(values, sourceInfo) => {
        switch (formValueFormat) {
          case "string"   : onChange(values.value); break;
          case "number"   : onChange(values.floatValue); break;
          case "formatted": onChange(values.formattedValue); break;
          default         : onChange(values.floatValue); break;
        }
        onValueChange?.(values, sourceInfo);
      }}
    />
  );
}

export default NumericFormatInput;

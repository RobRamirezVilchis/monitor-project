import { 
  NumberFormatBaseInput as _NumberFormatBaseInput,
  type NumberFormatBaseInputProps as _NumberFormatBaseInputProps,
} from "@/ui/base/core";
import { mergeRefs } from "@mantine/hooks";
import { FieldValues, useController } from "react-hook-form";

import { FormInputProps } from "@/ui/hook-form/base";

export interface NumberFormatBaseInputExtraProps {
  /**
   * The format of the value to be submitted to the form.
   * @default "number"
   */
  formValueFormat?: "number" | "string" | "formatted";
}

export type NumberFormatBaseInputProps<
  C = "input",
  TFieldValues extends FieldValues = FieldValues,
> = FormInputProps<TFieldValues> 
  & _NumberFormatBaseInputProps<C> 
  & NumberFormatBaseInputExtraProps;

const NumberFormatBaseInput = <
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
}: NumberFormatBaseInputProps<C, TFieldValues>) => {
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
    <_NumberFormatBaseInput
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

export default NumberFormatBaseInput;

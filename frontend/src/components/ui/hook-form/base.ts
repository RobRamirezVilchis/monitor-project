import { Ref } from "react";
import { UseControllerProps, FieldValues, FieldPath, FieldPathValue, Control } from "react-hook-form";

export type FormInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TInputProps extends { defaultValue?: any } = { defaultValue?: any },
  TRef = HTMLInputElement,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<UseControllerProps<TFieldValues, TName>,"control"> 
& Omit<TInputProps, "name" | "defaultValue" | "ref">
& {
  control: Control<TFieldValues>;
  inputRef?: Ref<TRef>;
};
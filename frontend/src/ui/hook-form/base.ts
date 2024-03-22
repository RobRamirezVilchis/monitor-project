import { RequiredKeys } from "@/utils/types";
import { Ref } from "react";
import { UseControllerProps, FieldValues, FieldPath, Control } from "react-hook-form";

export type FormInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TInputProps extends { defaultValue?: any } = { defaultValue?: any },
  TRef = HTMLInputElement,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = RequiredKeys<UseControllerProps<TFieldValues, TName>, "control">
& Omit<TInputProps, "name" | "defaultValue" | "ref">
& {
  inputRef?: Ref<TRef>;
};

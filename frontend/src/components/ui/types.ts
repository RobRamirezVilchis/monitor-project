import { FieldValues, FieldPath } from "react-hook-form";
import { FormInputProps } from "./hook-form/base";

export type BaseInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TInputProps extends { defaultValue?: any } = { defaultValue?: any },
  TRef = HTMLInputElement,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<FormInputProps<TFieldValues, TInputProps, TRef, TName>,
  "name" | "control" | "rules" | "shouldUnregister"
> & 
(
  ({
    control?: undefined;
    rules?: undefined;
    shouldUnregister?: undefined;
  } & Partial<
    Pick<FormInputProps<TFieldValues, TInputProps, TRef, TName>, "name">
  >) | 
  (Required<Pick<
    FormInputProps<TFieldValues, TInputProps, TRef, TName>, 
    "name" | "control">
  > & Pick<FormInputProps<TFieldValues, TInputProps, TRef, TName>, "rules" | "shouldUnregister">)
);

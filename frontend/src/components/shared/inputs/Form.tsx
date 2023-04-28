// @ts-nocheck

import React, { useEffect } from "react";
import {
  Control,
  FieldPath,
  FieldPathValue,
  FieldValues,
  FormProvider,
  RegisterOptions,
  SubmitErrorHandler,
  SubmitHandler,
  useForm,
  UseFormGetFieldState,
  UseFormProps,
  UseFormReturn,
} from "react-hook-form";
import { Subscription } from "react-hook-form/dist/utils/createSubject";

export interface FormProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any
> {
  children?: (
    formMethods: UseFormReturn<TFieldValues, TContext>, 
    formError?: string
  ) => React.ReactNode;
  formProps?: UseFormProps<TFieldValues, TContext>;
  onValidSubmit: SubmitHandler<TFieldValues>;
  onInvalidSubmit?: SubmitErrorHandler<TFieldValues>;
  formError?: string | null;
  onFormErrorClear?: () => void;
  classes?: {
    form?: string,
  }
}

export const Form = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = any
>({
  children,
  formProps,
  onValidSubmit,
  onInvalidSubmit,
  formError,
  onFormErrorClear: onFormErrorClearRequest,
  classes
}: FormProps<TFieldValues, TContext>) => {
  const formMethods = useForm<TFieldValues, TContext>(formProps);

  const { watch, setError, clearErrors, formState: { errors } } = formMethods;

  useEffect(() => {
    let subscription: Subscription | null = null;

    if (formError) {
      subscription = watch(
        (value, { name, type }) => {
          onFormErrorClearRequest && onFormErrorClearRequest(); 
        }
      );
    }
    return () => subscription?.unsubscribe();
  }, [watch, formError, onFormErrorClearRequest]);

  useEffect(() => {
    if (formError)
      setError("__form__", { type: "formError", message: formError });
    else
      clearErrors("__form__");

  }, [formError, setError, clearErrors]);

  return (
    <FormProvider {...formMethods}>
      <form 
        onSubmit={formMethods.handleSubmit(onValidSubmit, onInvalidSubmit)}
        className={classes?.form}
      >
        {children && children(formMethods, errors.__form__?.message as string)}
      </form>
    </FormProvider>
  );
};

export interface FormInputProps<TFieldValues extends FieldValues = FieldValues> { 
  name: FieldPath<TFieldValues>;
  shouldUnregisterField?: boolean;
  defaultFieldValue?: FieldPathValue<TFieldValues, FieldPath<TFieldValues>>;
  rules?: Omit<
    RegisterOptions<any, any>, 
    'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
  >;
}

export type FormInputConditionalProps<TFieldValues extends FieldValues = FieldValues> = FormInputProps<TFieldValues> | 
{ 
  name?: string;
  shouldUnregisterField?: undefined;
  defaultFieldValue?: undefined;
  rules?: undefined;
}
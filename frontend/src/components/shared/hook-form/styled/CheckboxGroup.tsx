import React from "react";
import { FieldValues } from "react-hook-form";

import { CheckboxGroup as BaseCheckboxGroup, CheckboxGroupProps as BaseCheckboxGroupProps } from "@/components/shared/hook-form";

export type CheckboxGroupProps<TFieldValues extends FieldValues = FieldValues> = {
  title?: React.ReactNode;
  /**
   * The component used to render the title container
   * @default div
   */
  titleAs?: React.ElementType;
  classes?: {
    title?: {
      /**
       * Style applied to the <label> tag containing the input
       */
      root?: string,
      /**
       * Style applied to the <span> that wraps the label prop
       */
      label?: string,
    }
  };
} & BaseCheckboxGroupProps<TFieldValues>;

export const CheckboxGroup = <TFieldValues extends FieldValues = FieldValues>({ 
  checkboxProps, title, titleAs, ...props 
}: CheckboxGroupProps<TFieldValues>) => {
  const classes = checkboxProps?.classes;
  const TitleAs = titleAs ?? "div";
  
  return (
    <TitleAs className={`${props?.classes?.title?.root}`}>
      {title ? (
        <span className={`block font-bold ${props?.classes?.title?.label}`}>
          {title}
        </span>
      ) : null}
      <BaseCheckboxGroup
        {...props}
        checkboxProps={{
          ...checkboxProps,
          classes: {
            ...classes,
            checked: "!text-blue-500 " + (classes?.checked || "")
          }
        }}
      />
    </TitleAs>
  )
}

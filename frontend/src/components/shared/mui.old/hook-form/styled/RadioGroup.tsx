import React from "react";
import { FieldValues } from "react-hook-form";

import { RadioGroup as BaseRadioGroup, RadioGroupProps as BaseRadioGroupProps } from "@/components/shared/mui.old/hook-form";

export type RadioGroupProps<TFieldValues extends FieldValues = FieldValues> = {
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
} & BaseRadioGroupProps<TFieldValues>;

export const RadioGroup = <TFieldValues extends FieldValues = FieldValues>({ 
  radioProps, title, titleAs, ...props 
}: RadioGroupProps<TFieldValues>) => {
  const classes = radioProps?.classes;
  const TitleAs = titleAs ?? "div";

  return (
    <TitleAs className={`${props?.classes?.title?.root}`}>
      {title ? (
        <span className={`block font-bold ${props?.classes?.title?.label}`}>
          {title}
        </span>
      ) : null}
      <BaseRadioGroup
        {...props}
        radioProps={{
          ...radioProps,
          classes: {
            ...classes,
            checked: "!text-blue-500 " + (classes?.checked || "")
          }
        }}
      />
    </TitleAs>
  )
}

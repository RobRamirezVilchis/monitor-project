import React from "react";
import { FieldValues } from "react-hook-form";

import { Checkbox as BaseCheckbox, CheckboxProps as BaseCheckboxProps } from "@/components/shared/mui.old/hook-form";

export type CheckboxProps<TFieldValues extends FieldValues = FieldValues> = {
  title?: React.ReactNode;
  /**
   * The component used to render the title container
   * @default label
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
} & BaseCheckboxProps<TFieldValues>;

export const Checkbox = <TFieldValues extends FieldValues = FieldValues>({
  classes, title, titleAs, ...props
}: CheckboxProps<TFieldValues>) => {
  const TitleAs = titleAs ?? "label";

  return (
    <TitleAs className={classes?.title?.root}>
      {title ? (
        <span className={`block font-bold ${classes?.title?.label}`}>
          {title}
        </span>
      ) : null}
      <BaseCheckbox
        {...props}
        classes={{
          ...classes,
          checkbox: {
            ...classes?.checkbox,
            checked:
              "!text-blue-500 " + (classes?.checkbox?.checked || ""),
            indeterminate: 
              "!text-blue-500 " + (classes?.checkbox?.indeterminate || ""),
          },
        }}
      />
    </TitleAs>
  );
};
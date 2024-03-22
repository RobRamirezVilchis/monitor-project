import { DistributiveOmit } from "@/utils/types";
import { InputBase, type InputBaseProps } from "@mantine/core";
import { PolymorphicComponentProps } from "@mantine/core/lib/core/factory/create-polymorphic-component";
import { forwardRef } from "react";
import { NumberFormatBase, type NumberFormatBaseProps } from 'react-number-format';

export type NumberFormatBaseInputProps<
  C = "input",
> = PolymorphicComponentProps<C, InputBaseProps> & DistributiveOmit<NumberFormatBaseProps, "component">;

const NumberFormatBaseInput = forwardRef((props: NumberFormatBaseInputProps, ref) => (
  <InputBase<any>
    {...props}
    getInputRef={ref}
    component={NumberFormatBase as any}
  />
));
NumberFormatBaseInput.displayName = "NumberFormatBaseInput";

export default NumberFormatBaseInput;

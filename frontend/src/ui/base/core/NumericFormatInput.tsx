import { DistributiveOmit } from "@/utils/types";
import { InputBase, type InputBaseProps } from "@mantine/core";
import { PolymorphicComponentProps } from "@mantine/core/lib/core/factory/create-polymorphic-component";
import { forwardRef } from "react";
import { NumericFormat, type NumericFormatProps } from 'react-number-format';

export type NumericFormatInputProps<
  C = "input",
> = PolymorphicComponentProps<C, InputBaseProps> & DistributiveOmit<NumericFormatProps, "component">;

const NumericFormatInput = forwardRef((props: NumericFormatInputProps, ref) => (
  <InputBase<any>
    {...props}
    getInputRef={ref}
    component={NumericFormat as any}
  />
));
NumericFormatInput.displayName = "NumericFormatInput";

export default NumericFormatInput;

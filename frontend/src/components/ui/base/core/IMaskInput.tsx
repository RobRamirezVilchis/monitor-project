import { DistributiveOmit } from "@/utils/types";
import { InputBase, type InputBaseProps } from "@mantine/core";
import { PolymorphicComponentProps } from "@mantine/core/lib/core/factory/create-polymorphic-component";
import { ComponentPropsWithoutRef, ForwardedRef, forwardRef } from "react";
import { 
  IMaskInput as _IMaskInput,
} from "react-imask";

type _IMaskInputProps = ComponentPropsWithoutRef<typeof _IMaskInput>;

export type IMaskInputProps<
  C = "input",
> = PolymorphicComponentProps<C, InputBaseProps> & DistributiveOmit<_IMaskInputProps, "component">;

const _IMaskInput_ = <
  C = "input",
>(props: IMaskInputProps<C>, ref: ForwardedRef<any>) => (
  <InputBase<C>
    {...props as any}
    ref={ref as any}
    component={_IMaskInput as any}
  />
);

const IMaskInput = forwardRef(_IMaskInput_) as <C = "input">(props: IMaskInputProps<C> & { ref?: ForwardedRef<any> }) => JSX.Element;

export default IMaskInput;

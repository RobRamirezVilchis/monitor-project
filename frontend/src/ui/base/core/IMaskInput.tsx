import { InputBase, type InputBaseProps } from "@mantine/core";
import { PolymorphicComponentProps } from "@mantine/core/lib/core/factory/create-polymorphic-component";
import { ForwardedRef, forwardRef } from "react";
import { 
  IMaskInput as _IMaskInput,
  IMaskInputProps as _IMaskInputProps,
  IMaskMixinProps,
} from "react-imask";
import { 
  MaskedOptions, 
  MaskedPatternOptions,
  MaskedDateOptions,
  MaskedNumberOptions,
  MaskedEnumOptions,
  MaskedRangeOptions,
  MaskedRegExpOptions,
  MaskedFunctionOptions,
  MaskedDynamicOptions,
} from "imask";

import { RequiredKeys } from "@/utils/types";

export type IMaskInputProps = Omit<PolymorphicComponentProps<"input", InputBaseProps>, "component" | "ref"> 
& Omit<RequiredKeys<IMaskMixinProps<HTMLInputElement>, "mask">, "ref" | "inputRef"> 
& Partial<Omit<MaskedOptions, "mask">>
& Partial<Omit<MaskedPatternOptions, "mask">>
& Partial<Omit<MaskedDateOptions, "mask">>
& Partial<Omit<MaskedNumberOptions, "mask">>
& Partial<Omit<MaskedEnumOptions, "mask">>
& Partial<Omit<MaskedRangeOptions, "mask">>
& Partial<Omit<MaskedRegExpOptions, "mask">>
& Partial<Omit<MaskedFunctionOptions, "mask">>
& Partial<Omit<MaskedDynamicOptions, "mask">>
& {
  maskRef?: IMaskMixinProps<HTMLInputElement>["ref"];
};

const _IMaskInput_ = ({ 
  maskRef,
  ...props
}: IMaskInputProps, ref: ForwardedRef<HTMLInputElement>) => (
  <InputBase
    {...props}
    ref={maskRef}
    inputRef={ref}
    component={_IMaskInput as any} 
  />
);

const IMaskInput = forwardRef(_IMaskInput_) as (props: IMaskInputProps & { ref?: ForwardedRef<HTMLInputElement> }) => JSX.Element;

export default IMaskInput;

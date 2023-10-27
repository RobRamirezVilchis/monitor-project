import { 
  TagsInput as _MantineTagsInput,
  type TagsInputProps as _TagsInputProps,
} from "@mantine/core";
import { FieldValues } from "react-hook-form";

import type { BaseInputProps } from "../types";
import _TagsInput from "../hook-form/core/TagsInput";

export type TagsInputProps<
  TFieldValues extends FieldValues = FieldValues,
> = BaseInputProps<TFieldValues, _TagsInputProps>;

const TagsInput = <
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  inputRef,
  ...props
}: TagsInputProps<TFieldValues>) => {
  if (control && name)
    return <_TagsInput name={name} control={control} rules={rules} shouldUnregister={shouldUnregister} inputRef={inputRef} {...props} />;
  else
    return <_MantineTagsInput name={name} ref={inputRef} {...props} />;
}

export default TagsInput;

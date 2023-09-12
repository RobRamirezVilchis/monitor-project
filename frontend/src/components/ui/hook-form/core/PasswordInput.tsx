import { 
  PasswordInput as _PasswordInput,
  type PasswordInputProps as _PasswordInputProps,
} from "@mantine/core";
import { FieldValues, useController } from "react-hook-form";
import { mergeRefs } from "@mantine/hooks";

import { FormInputProps } from "@/components/ui/hook-form/base";

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

export type PasswordInputProps<
  TFieldValues extends FieldValues = FieldValues,
> = FormInputProps<TFieldValues, _PasswordInputProps>;

const PasswordInput = <
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  rules,
  shouldUnregister,
  defaultValue,
  onChange: _onChange,
  onBlur: _onBlur,
  inputRef,
  ...props
}: PasswordInputProps<TFieldValues>) => {
  const {
    field: { value, onChange, onBlur, ref, ...field },
    fieldState,
  } = useController<TFieldValues>({ 
    name,
    control,
    rules,
    shouldUnregister,
    defaultValue,
  });

  return (
    <_PasswordInput
      visibilityToggleIcon={MuiVisibilityToggleIcon}
      {...field}
      {...props}
      value={value}
      onChange={(...args) => {
        onChange(...args);
        _onChange?.(...args);
      }}
      onBlur={(...args) => {
        onBlur();
        _onBlur?.(...args);
      }}
      ref={mergeRefs(ref, inputRef)}
      error={fieldState.error?.message}
    />
  );
}

export default PasswordInput;

export const MuiVisibilityToggleIcon = ({
  reveal
}: { reveal: boolean }) => {
  return reveal 
    ? <VisibilityOffIcon fontSize="small" /> 
    : <VisibilityIcon    fontSize="small" />;
}
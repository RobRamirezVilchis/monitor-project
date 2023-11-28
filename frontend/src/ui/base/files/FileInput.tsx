import { ComponentPropsWithoutRef, ForwardedRef, ReactNode, forwardRef } from "react";
import { 
  CloseButton, 
  type ElementProps, 
  FileButton, 
  Input, 
  InputBase, type InputBaseProps,
} from "@mantine/core";

import { useUncontrolled } from "@mantine/hooks";
import { formatBytes } from "@/utils/utils";

export interface FileDetails {
  readonly name: string;
  readonly size: number;
  readonly type: string;
  readonly file?: File;
}

export interface FileInputProps<Multiple extends boolean = false> 
  extends InputBaseProps,
  ElementProps<"button", "value" | "defaultValue" | "onChange"> {
  value?: Multiple extends false ? FileDetails | null : FileDetails[];
  defaultValue?: Multiple extends false ? FileDetails | null : FileDetails[];
  /** Comma-separated list of content types. */
  accept?: string;
  /** Whether to allow multiple files. */
  multiple?: Multiple;
  /**
   * Whether to append or replace the files in the collection when multiple is true.
   * @default "replace"
   */
  mode?: "append" | "replace";
  /**
   * Whether to show a clear button when there is a value.
   * @default false
   */
  clearable?: boolean;
  placeholder?: string;
  clearButtonProps?: ComponentPropsWithoutRef<"button">;
  renderValue?: (value: Multiple extends false ? FileDetails | null : FileDetails[]) => ReactNode;
  onChange?: (value: Multiple extends false ? FileDetails | null : FileDetails[]) => void;
}

const _FileInput = forwardRef<HTMLButtonElement, FileInputProps>(({
  name,
  accept,
  value,
  defaultValue,
  clearable = false,
  multiple = false,
  mode = "replace",
  placeholder = "Select file",
  clearButtonProps,
  renderValue,
  onChange,
  ...props
}, ref) => {
  const [_value, setValue] = useUncontrolled({
    value,
    defaultValue,
    finalValue: multiple ? [] as any : null,
    onChange,
  });
  const hasValue = Array.isArray(_value) ? _value.length !== 0 : _value !== null;

  return (
    <FileButton
      name={name}
      accept={accept}
      multiple={multiple}
      onChange={(payload) => setValue(parseFilesPayload(payload, multiple, mode, _value) as any)}
    >
      {(fileBtnProps) => (
        <InputBase
          component="button"
          ref={ref}
          rightSection={clearable && hasValue && !props.disabled ? (
            <CloseButton
              radius="xl"
              {...clearButtonProps}
              onClick={(e) => {
                e.stopPropagation();
                setValue((multiple ? [] : null) as any);
              }}
            />
          ) : undefined}
          {...fileBtnProps}
          {...props}
          multiline
          type="button"
          pointer
        >
          {!hasValue ? (
            <Input.Placeholder>{placeholder}</Input.Placeholder>
          ) : (
            renderValue ? renderValue(_value) : (
              Array.isArray(_value) 
              ? (<span>{_value.map(file => `${file.name} (${formatBytes(file.size)})`).join(", ")}</span>)
              : (_value ? <span>{_value.name} ({formatBytes(_value.size)})</span> : null)
            )
          )}
        </InputBase>
      )}
    </FileButton>
  );
});
_FileInput.displayName = "FileInput";

type FileInputComponent = <Multiple extends boolean = false>(
  props: FileInputProps<Multiple> 
  & { ref?: ForwardedRef<HTMLButtonElement>; }
) => JSX.Element;

export const FileInput: FileInputComponent = _FileInput as any;

function parseFilesPayload<Multiple extends boolean = false>(
  payload: Multiple extends false ? File | null : File[], 
  multiple: Multiple,
  mode: "append" | "replace", 
  currentValue: Multiple extends false ? FileDetails | null : FileDetails[]
) {
  if (!payload) return null;
  if (multiple) {
    const files = payload as File[];
    if (mode === "append") {
      const copy = [...currentValue as FileDetails[]];
      for (let i = 0; i < files.length; ++i) {
        copy.push({
          name: files[i].name,
          size: files[i].size,
          type: files[i].type,
          file: files[i],
        });
      }
      return copy;
    }
    else {
      return files.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        file,
      }));
    }
  }
  else {
    const file = payload as File;
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
    };
  }
}

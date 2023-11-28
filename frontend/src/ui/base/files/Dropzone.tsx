"use client";

import { MutableRefObject, ReactNode, forwardRef } from "react";
import { 
  Paper, type PaperProps,
  LoadingOverlay, type LoadingOverlayProps,
  useMantineTheme,
  MantineColor,
} from "@mantine/core";
import { useMergedRef } from "@mantine/hooks";
import { DropzoneOptions, DropzoneRef, useDropzone } from "react-dropzone";
import clsx from "clsx";

import styles from "./Dropzone.module.css";

import { IconX, IconCloudUpload, IconUpload } from "@tabler/icons-react";
import { useIsomorphicLayoutEffect } from "@/hooks/shared";

export interface DropzoneClasses {
  root: string;
  content: {
    root?: string;
    labelContainer?: string;
    label?: string;
  };
}

export interface DropzoneState {
  isDragActive: boolean;
  isFocused: boolean;
  isDragAccept: boolean;
  isDragReject: boolean;
  isFileDialogActive: boolean;
}

export interface DropzoneProps extends DropzoneOptions {
  children?: ReactNode | ((props: DropzoneState) => ReactNode);
  paperProps?: Omit<PaperProps, "className" | "classNames" | "ref">;
  classNames?: Partial<DropzoneClasses> | ((props: DropzoneState) => Partial<DropzoneClasses>);
  loading?: boolean;
  loadingOverlayProps?: LoadingOverlayProps;
  dropzoneRef?: MutableRefObject<DropzoneRef | null>;
  overrideContent?: boolean;
  label?: ReactNode | ((props: DropzoneState) => ReactNode);
  description?: ReactNode;
  defaultIcon?: ReactNode;
  acceptedFilesIcon?: ReactNode;
  rejectedFilesIcon?: ReactNode;
}

/**
 * @see https://react-dropzone.js.org/
 */
export const Dropzone = forwardRef<HTMLDivElement, DropzoneProps>(({
  children,
  paperProps,
  classNames: _classNames,
  loading,
  loadingOverlayProps,
  dropzoneRef,
  overrideContent,
  label,
  description,
  defaultIcon,
  acceptedFilesIcon,
  rejectedFilesIcon,
  ...props
}, ref) => {
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isFocused,
    isDragAccept,
    isDragReject,
    isFileDialogActive,
    open,
  } = useDropzone({
    ...props,
    disabled: loading || props.disabled,
  });
  const dropzoneState: DropzoneState = {
    isDragActive,
    isFocused,
    isDragAccept,
    isDragReject,
    isFileDialogActive,
  }
  const classNames = typeof _classNames === "function" ? _classNames?.(dropzoneState) : _classNames;
  const theme = useMantineTheme();
  const baseColor: MantineColor = isDragReject ? "red" : theme.primaryColor;
  const primaryColorFilled = theme.variantColorResolver({
    color: baseColor,
    theme,
    variant: "filled",
  });
  const primaryColorSubtle = theme.variantColorResolver({
    color: baseColor,
    theme,
    variant: "subtle",
  });
  const { ref: _rootRef, ...rootProps } = getRootProps({
    ...paperProps,
    className: clsx("relative p-5", styles.root, classNames?.root, {
      "cursor-pointer": !props.noClick,
      "cursor-not-allowed": props.disabled,
    }),
    style: {
      borderColor: isFocused || isDragActive ? primaryColorFilled.background : undefined,
      backgroundColor: isDragActive ? primaryColorSubtle.hover : undefined,
      ...paperProps?.style,
    } as any,
  }) as any;
  const rootRef = useMergedRef(ref, _rootRef);

  useIsomorphicLayoutEffect(() => {
    if (dropzoneRef) 
      dropzoneRef.current = { open };

    return () => {
      if (dropzoneRef)
        dropzoneRef.current = null;
    }
  }, [open, dropzoneRef]);

  return (
    <Paper
      {...rootProps}
      ref={rootRef}
    >
      <input {...getInputProps()} />

      <div 
        className={clsx(classNames?.content?.root, {
          "pointer-events-none": isDragActive,
        })}
      >
        {!overrideContent ? (
          <div 
            className={clsx("flex flex-col justify-center items-center gap-2", classNames?.content?.labelContainer)}
          >
            {!isDragActive && (defaultIcon || <IconCloudUpload size={48} className={styles.dimmed} />)}
            {isDragActive && !isDragReject && (acceptedFilesIcon || <IconUpload size={48} color={primaryColorFilled.background} />)}
            {isDragReject && (rejectedFilesIcon ||  <IconX size={48} color={primaryColorFilled.background} />)}

            <span 
              className={clsx("text-xl", classNames?.content?.label, {
                [styles.dimmed]: props.disabled,
              })} 
              style={{ color: isDragReject ? primaryColorSubtle.color : undefined }}
            >
              {label
              ? (typeof label === "function" ? label?.(dropzoneState) : label)
              : "Drag and drop files here"}
            </span>
          </div>
        ) : null}

        {typeof children === "function"
        ? children?.(dropzoneState)
        : children}
      </div>

      <LoadingOverlay
        {...loadingOverlayProps} 
        visible={loading} 
      />
    </Paper>
  );
});
Dropzone.displayName = "Dropzone";

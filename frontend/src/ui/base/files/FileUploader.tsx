import { Dispatch, MouseEvent, MouseEventHandler, ReactNode, SetStateAction, useLayoutEffect, useRef, useState } from "react";
import { ActionIcon, Loader, Progress, Tooltip, ThemeIcon } from "@mantine/core";
import { useUncontrolled } from "@mantine/hooks";

import type { FileDetails } from "./FileDetails";
import { useIsomorphicLayoutEffect, useOnMount, useOnUnmount, usePrevious } from "@/hooks/shared";
import { Dropzone, type DropzoneProps } from "./Dropzone";
import { useImmer } from "use-immer";
import clsx from "clsx";

import styles from "./FileUploader.module.css";

import { formatBytes } from "@/utils/utils";

import {
  IconCheck,
  IconCloudDownload,
  IconCloudUpload,
  IconDownload, 
  IconFile,
  IconRefresh,
  IconUpload, 
  IconX,
} from "@tabler/icons-react";

type EditableFileDetails = Pick<FileDetails, "meta">;

// TODO: Add check for when file is already uploaded so it allow download instead of upload
// TODO: Fix auto upload initial error even when file is uploaded

export interface FileUploaderProps extends DropzoneProps {
  value?: FileDetails[];
  defaultValue?: FileDetails[];
  onChange?: (value: FileDetails[]) => void;
  error?: ReactNode;

  autoUpload?: boolean;
  showUploadProgress?: boolean;
  showDownloadProgress?: boolean;
  uploadFn?: (file: FileDetails, signal: AbortSignal, setProgress: Dispatch<SetStateAction<number>>) => Promise<unknown>;
  downloadFn?: (file: FileDetails, signal: AbortSignal, setProgress: Dispatch<SetStateAction<number>>) => Promise<unknown>;
  onFileUpload?: (file: FileDetails, data: any, update: (file: EditableFileDetails) => void) => void;
  onFileDownload?: (file: FileDetails, data: any, update: (file: EditableFileDetails) => void) => void;
  onFileUploadError?: (file: FileDetails, error: any) => void;
  onFileDownloadError?: (file: FileDetails, error: any) => void;
  onRemoveFile?: (file: FileDetails) => void;
  
  onFileUploadClick?: MouseEventHandler<HTMLButtonElement>;
  onFileDownloadClick?: MouseEventHandler<HTMLButtonElement>;
  onCancelUploadClick?: MouseEventHandler<HTMLButtonElement>;
  onCancelDownloadClick?: MouseEventHandler<HTMLButtonElement>;
  onRetryUploadClick?: MouseEventHandler<HTMLButtonElement>;
  onRetryDownloadClick?: MouseEventHandler<HTMLButtonElement>;
  onRemoveFileClick?: MouseEventHandler<HTMLButtonElement>;
}

export const FileUploader = ({
  value,
  defaultValue,
  onChange,
  error,

  autoUpload = false,
  showUploadProgress = true,
  showDownloadProgress = true,
  uploadFn,
  downloadFn,
  onFileUpload,
  onFileDownload,
  onFileUploadError,
  onFileDownloadError,
  onRemoveFile,

  onFileUploadClick,
  onFileDownloadClick,
  onCancelUploadClick,
  onCancelDownloadClick,
  onRetryUploadClick,
  onRetryDownloadClick,
  onRemoveFileClick,

  ...props
}: FileUploaderProps) => {
  const [files, setFiles] = useUncontrolled<FileDetails[]>({
    value,
    defaultValue,
    finalValue: [],
    onChange,
  });

  const updateFile = (file: FileDetails, index: number) => {
    const copy = [...files];
    copy[index] = file;
    setFiles(copy);
  }

  const removeFile = (file: FileDetails, index: number) => {
    const copy = [...files];
    copy.splice(index, 1);
    setFiles(copy);
    onRemoveFile?.(file);
  };

  return (
    <div className="flex flex-col gap-4">
      <Dropzone 
        {...props}
        onDropAccepted={(droppedFiles, event) => {
          const copy = [...files];
          const newFiles: FileDetails[] = droppedFiles.map((file) => ({
            name: file.name,
            size: file.size,
            type: file.type,
            file,
          }));
          copy.push(...newFiles);
          setFiles(copy);
          props.onDropAccepted?.(droppedFiles, event);
        }}
      />

      <div className="flex flex-col gap-2">
        {files.map((file, idx) => (
          <FileUploaderItem 
            key={idx} 
            file={file}

            autoUpload={autoUpload}
            showUploadProgress={showUploadProgress}
            showDownloadProgress={showDownloadProgress}
            uploadFn={uploadFn}
            downloadFn={downloadFn}
            onFileUpload={(file, data) => {
              const copy = { ...file };
              let updated = false;
              const update = (file: EditableFileDetails) => {
                Object.assign(file, copy);
                updated = true;
              }
              onFileUpload?.(file, data, update);
              if (updated) updateFile(copy, idx);
            }}
            onFileDownload={(file, data) => {
              const copy = { ...file };
              let updated = false;
              const update = (file: EditableFileDetails) => {
                Object.assign(file, copy);
                updated = true;
              }
              onFileDownload?.(file, data, update);
              if (updated) updateFile(copy, idx);
            }}
            onFileUploadError={onFileUploadError}
            onFileDownloadError={onFileDownloadError}

            onFileUploadClick={onFileUploadClick}
            onFileDownloadClick={onFileDownloadClick}
            onCancelUploadClick={onCancelUploadClick}
            onCancelDownloadClick={onCancelDownloadClick}
            onRetryUploadClick={onRetryUploadClick}
            onRetryDownloadClick={onRetryDownloadClick}
            onRemoveFileClick={(event) => {
              onRemoveFileClick?.(event);
              removeFile(file, idx);
            }}
          />
        ))}
      </div>
    </div>
  );
};


interface FileUploaderItemProps {
  file: FileDetails;

  autoUpload?: boolean;
  showUploadProgress?: boolean;
  showDownloadProgress?: boolean;
  uploadFn?: (file: FileDetails, signal: AbortSignal, setProgress: Dispatch<SetStateAction<number>>) => Promise<unknown>;
  downloadFn?: (file: FileDetails, signal: AbortSignal, setProgress: Dispatch<SetStateAction<number>>) => Promise<unknown>;
  onFileUpload?: (file: FileDetails, data: unknown) => void;
  onFileDownload?: (file: FileDetails, data: unknown) => void;
  onFileUploadError?: (file: FileDetails, error: unknown) => void;
  onFileDownloadError?: (file: FileDetails, error: unknown) => void;
  
  onFileUploadClick?: MouseEventHandler<HTMLButtonElement>;
  onFileDownloadClick?: MouseEventHandler<HTMLButtonElement>;
  onCancelUploadClick?: MouseEventHandler<HTMLButtonElement>;
  onCancelDownloadClick?: MouseEventHandler<HTMLButtonElement>;
  onRetryUploadClick?: MouseEventHandler<HTMLButtonElement>;
  onRetryDownloadClick?: MouseEventHandler<HTMLButtonElement>;
  onRemoveFileClick?: MouseEventHandler<HTMLButtonElement>;
}

type FileUploadState = "idle" | "uploading" | "downloading" | "success" | "upload-error" | "download-error";

const FileUploaderItem = ({
  file,

  autoUpload = false,
  showUploadProgress = true,
  showDownloadProgress = true,
  uploadFn,
  downloadFn,
  onFileUpload,
  onFileDownload,
  onFileUploadError,
  onFileDownloadError,

  onFileUploadClick,
  onFileDownloadClick,
  onCancelUploadClick,
  onCancelDownloadClick,
  onRetryUploadClick,
  onRetryDownloadClick,
  onRemoveFileClick,
}: FileUploaderItemProps) => {
  const [state, setState] = useState<FileUploadState>("idle");
  const [progress, setProgress] = useState(0);
  const abortController = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useOnMount(() => {
    if (autoUpload) uploadFile();
    console.log("FileUploaderItem: useOnMount")
  });
  
  useOnUnmount(() => {
    abortController.current?.abort();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  });

  useIsomorphicLayoutEffect(() => {
    switch (state) {
      case "success":
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setState("idle"), 1000);
        break;
    }
  }, [state]);

  const uploadFile = async () => {
    if (!file.file) return;

    setState("uploading");
    abortController.current = new AbortController();
    const signal = abortController.current.signal;
    try {
      const data = await uploadFn?.(file, signal, setProgress);
      setState("success");
      onFileUpload?.(file, data);
    }
    catch (error) {
      setState("upload-error");
      onFileUploadError?.(file, error);
    }
    finally {
      setProgress(0);
      abortController.current = null;
    }
  };

  const downloadFile = async () => {
    setState("downloading");
    abortController.current = new AbortController();
    const signal = abortController.current.signal;
    try {
      const data = await downloadFn?.(file, signal, setProgress);
      setState("success");
      onFileDownload?.(file, data);
    }
    catch (error) {
      setState("download-error");
      onFileDownloadError?.(file, error);
    }
    finally {
      setProgress(0);
      abortController.current = null;
    }
  };

  const _onFileUploadClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    onFileUploadClick?.(event);
    uploadFile();
  };

  const _onFileDownloadClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    onFileDownloadClick?.(event);
    downloadFile();
  };

  const _onCancelClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    switch (state) {
      case "idle":
      case "upload-error":
      case "download-error":
        onRemoveFileClick?.(event);
        break;
      case "uploading":
        onCancelUploadClick?.(event);
        break;
      case "downloading":
        onCancelDownloadClick?.(event);
        break;
    }

    abortController.current?.abort();
    setState("idle");
    setProgress(0);
  };

  const _onRetryClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    console.log(state)
    switch (state) {
      case "upload-error":
        console.log("retry upload")
        onRetryUploadClick?.(event);
        uploadFile();
        break;
      case "download-error":
        console.log("retry download")
        onRetryDownloadClick?.(event);
        downloadFile();
        break;
    }
  };

  return (  
    <div
      className={clsx("flex items-center gap-2", styles["file-root"], {
        "border !border-red-500 !text-red-400": state === "upload-error" || state === "download-error",
      })}
    >
      <IconFile size={36} className={clsx({
        "text-gray-400": state !== "upload-error" && state !== "download-error",
        "text-red-400": state === "upload-error" || state === "download-error",
      })} />

      <div className="flex-1 truncate flex flex-col gap-2">
        <div className="flex-1 flex gap-2">
          <div className="flex-1 truncate flex flex-col">
            <span className="truncate text-lg font-semibold" title={file.name}>
              {file.name}
            </span>

            <span className="text-sm text-gray-400">
              {formatBytes(file.size)}
            </span>
          </div>

          {state === "uploading" && showUploadProgress ? <span>{progress}%</span> : null}
          {state === "downloading" && showDownloadProgress ? <span>{progress}%</span> : null}
        </div>

        {state === "uploading" && showUploadProgress ? <Progress size="sm" value={progress} /> : null}
        {state === "downloading" && showDownloadProgress ? <Progress size="sm" value={progress} /> : null}
      </div>

      {state === "uploading" && !showUploadProgress ? <Loader size="sm" /> : null}
      {state === "downloading" && !showDownloadProgress ? <Loader size="sm" /> : null}

      {state === "idle" && file?.file ? (
        <Tooltip label="Upload">
          <ActionIcon radius="xl" variant="light"
            onClick={_onFileUploadClick}
          >
            <IconCloudUpload />
          </ActionIcon>
        </Tooltip>
      ) : null}

      {state === "idle" && !file.file ? (
        <Tooltip label="Download">
          <ActionIcon radius="xl" variant="light"
            onClick={_onFileDownloadClick}
          >
            <IconCloudDownload />
          </ActionIcon>
        </Tooltip>
      ) : null}

      {state === "upload-error" || state === "download-error" ? (
        <Tooltip label="Retry">
          <ActionIcon radius="xl" variant="light"
            onClick={_onRetryClick}
          >
            <IconRefresh />
          </ActionIcon>
        </Tooltip>
      ) : null}

      {state === "success" ? (
        <ThemeIcon radius="xl" variant="light" color="green">
          <IconCheck />
        </ThemeIcon>
      ) : null}

      {state !== "success" ? (
        <Tooltip label="Cancel">
          <ActionIcon radius="xl" variant="light" color="red"
            onClick={_onCancelClick}
          >
            <IconX />
          </ActionIcon>
        </Tooltip>
      ) : null}
    </div>
  );
}
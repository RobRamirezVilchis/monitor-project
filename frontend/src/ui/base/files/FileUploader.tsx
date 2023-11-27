import { Dispatch, MouseEvent, MouseEventHandler, ReactNode, SetStateAction, useRef, useState } from "react";
import { ActionIcon, Loader, Progress, Tooltip, ThemeIcon } from "@mantine/core";
import { useUncontrolled } from "@mantine/hooks";

import { useIsomorphicLayoutEffect, useOnMount, useOnUnmount } from "@/hooks/shared";
import { Dropzone, type DropzoneProps } from "./Dropzone";
import { useImmer } from "use-immer";
import clsx from "clsx";

import styles from "./FileUploader.module.css";

import { formatBytes } from "@/utils/utils";

export interface FileDetails<D = any> {
  readonly name: string;
  readonly size: number;
  readonly type: string;
  readonly file?: File;
  /**
   * Data used by the downloadFn. This is set after a successful upload.
   * If undefined, the file allows uploading.
   * If null, the file is considered uploaded, but won't allow download.
   * For any other value, the file is considered uploaded and allows download.
   */
  downloadData?: D | null;
}

export type FileUploadDetails<D = any> = Required<Omit<FileDetails<D>, "downloadData">>;

export type FileDownloadDetails<D = any> = Required<Omit<FileDetails<D>, "file" | "downloadData">> & {
  downloadData: D;
};

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

// TODO: Fix auto upload initial error even when file is uploaded

export interface FileUploaderProps<D = any> extends DropzoneProps, FileUploaderConfig<D>, FileUploaderClickCallbacks {
  value?: FileDetails<D>[];
  defaultValue?: FileDetails<D>[];
  onChange?: (value: FileDetails<D>[]) => void;
  error?: ReactNode;
}

export interface FileUploaderConfig<D = any> {
  /**
   * If true, files will be uploaded as soon as they are dropped.
   * 
   * WARNING: This will also affect initial files if the file property is set!
   * @default false
   */
  autoUpload?: boolean;
  /** If true, the upload progress will be shown. */
  showUploadProgress?: boolean;
  /** If true, the download progress will be shown. */
  showDownloadProgress?: boolean;
  /**
   * Function to upload a file.
   * 
   * The function must return a promise that resolves when the upload is complete and
   * the data returned will be set as the file `downloadData` property.
   * 
   * If the promise rejects, the upload is considered failed.
   * @param file The file details for the file to upload.
   * @param signal An AbortSignal to abort the upload when the component unmounts or the upload is cancelled by the user.
   * @param setProgress A function to update the upload progress.
   * @returns A promise with the data to update the file details object `downloadData` property.
   */
  uploadFn?: (file: FileUploadDetails<D>, signal: AbortSignal, setProgress: Dispatch<SetStateAction<number>>) => Promise<D | null>;
  /**
   * Function to download a file.
   * 
   * The function must return a promise that resolves when the download is complete.
   * 
   * If the promise rejects, the download is considered failed.
   * @param file The file details for the file to download.
   * @param signal An AbortSignal to abort the download when the component unmounts or the download is cancelled by the user.
   * @param setProgress A function to update the download progress.
   * @returns A promise with the data to update the file details object `downloadData` property.
   */
  downloadFn?: (file: FileDownloadDetails<D>, signal: AbortSignal, setProgress: Dispatch<SetStateAction<number>>) => Promise<unknown>;
  /**
   * Function called when a file upload succeeds.
   * 
   * @param file The file details for the file that was uploaded.
   * @param data The data returned by the uploadFn.
   */
  onFileUpload?: (file: FileUploadDetails<D>, data: any) => void;
  /**
   * Function called when a file download succeeds.
   * @param file The file details for the file that was downloaded.
   * @param data The data returned by the downloadFn.
   */
  onFileDownload?: (file: FileDownloadDetails<D>, data: any) => void;
  /**
   * Function called when a file upload fails.
   * @param file The file details for the file that failed to upload.
   * @param error The error returned by the uploadFn.
   */
  onFileUploadError?: (file: FileUploadDetails<D>, error: any) => void;
  /**
   * Function called when a file download fails.
   * @param file The file details for the file that failed to download.
   * @param error The error returned by the downloadFn.
   */
  onFileDownloadError?: (file: FileDownloadDetails<D>, error: any) => void;
  /**
   * Function called when a file is removed.
   * @param file The file details for the file that was removed.
   */
  onFileRemoved?: (file: FileDetails<D>) => void;
}

export interface FileUploaderClickCallbacks {
  onFileUploadClick?: MouseEventHandler<HTMLButtonElement>;
  onFileDownloadClick?: MouseEventHandler<HTMLButtonElement>;
  onCancelUploadClick?: MouseEventHandler<HTMLButtonElement>;
  onCancelDownloadClick?: MouseEventHandler<HTMLButtonElement>;
  onRetryUploadClick?: MouseEventHandler<HTMLButtonElement>;
  onRetryDownloadClick?: MouseEventHandler<HTMLButtonElement>;
  onRemoveFileClick?: MouseEventHandler<HTMLButtonElement>;
}

export const FileUploader = <D extends unknown = any>({
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
  onFileRemoved,

  onFileUploadClick,
  onFileDownloadClick,
  onCancelUploadClick,
  onCancelDownloadClick,
  onRetryUploadClick,
  onRetryDownloadClick,
  onRemoveFileClick,

  ...props
}: FileUploaderProps<D>) => {
  const [files, setFiles] = useUncontrolled<FileDetails<D>[]>({
    value,
    defaultValue,
    finalValue: [],
    onChange,
  });

  const removeFile = (file: FileDetails<D>, index: number) => {
    const copy = [...files];
    copy.splice(index, 1);
    setFiles(copy);
    onFileRemoved?.(file);
  };

  const fileUploadHandler = (file: FileDetails<D>, index: number, data: any) => {
    onFileUpload?.(file as FileUploadDetails<D>, data);

    const copy = [...files];
    copy[index].downloadData = data;
    setFiles(copy);
  };

  return (
    <div className="flex flex-col gap-4">
      <Dropzone 
        {...props}
        onDropAccepted={(droppedFiles, event) => {
          const copy = [...files];
          const newFiles: FileDetails<D>[] = droppedFiles.map((file) => ({
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
            onFileUpload={(file, data) => fileUploadHandler(file, idx, data)}
            onFileDownload={onFileDownload}
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


interface FileUploaderItemProps<D = any> extends FileUploaderConfig<D>, FileUploaderClickCallbacks {
  file: FileDetails;
}

type FileUploadState = "idle" | "uploading" | "downloading" | "success" | "upload-error" | "download-error";

const FileUploaderItem = <D extends unknown = any>({
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
}: FileUploaderItemProps<D>) => {
  const [state, setState] = useState<FileUploadState>("idle");
  const [progress, setProgress] = useState(0);
  const abortController = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useOnMount(() => {
    if (autoUpload) uploadFile();
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
    if (!file.file) {
      setState("upload-error");
      onFileUploadError?.(file as FileUploadDetails<D>, {
        message: `File ${file.name} not found`,
      });
      return;
    }

    setState("uploading");
    abortController.current = new AbortController();
    const signal = abortController.current.signal;
    try {
      const data = await uploadFn?.(file as FileUploadDetails<D>, signal, setProgress);
      setState("success");
      onFileUpload?.(file as FileUploadDetails<D>, data);
    }
    catch (error) {
      setState("upload-error");
      onFileUploadError?.(file as FileUploadDetails<D>, error);
    }
    finally {
      setProgress(0);
      abortController.current = null;
    }
  };

  const downloadFile = async () => {
    if (file.downloadData === undefined || file.downloadData === null) {
      setState("download-error");
      onFileDownloadError?.(file as FileDownloadDetails<D>, {
        message: `File ${file.name} does not allow download`,
      });
      return;
    }

    setState("downloading");
    abortController.current = new AbortController();
    const signal = abortController.current.signal;
    try {
      const data = await downloadFn?.(file as FileDownloadDetails<D>, signal, setProgress);
      setState("success");
      onFileDownload?.(file as FileDownloadDetails<D>, data);
    }
    catch (error) {
      setState("download-error");
      onFileDownloadError?.(file as FileDownloadDetails<D>, error);
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
    switch (state) {
      case "upload-error":
        onRetryUploadClick?.(event);
        uploadFile();
        break;
      case "download-error":
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

      {state === "idle" && file?.file && file.downloadData === undefined ? (
        <Tooltip label="Upload">
          <ActionIcon radius="xl" variant="light"
            onClick={_onFileUploadClick}
          >
            <IconCloudUpload />
          </ActionIcon>
        </Tooltip>
      ) : null}

      {state === "idle" && file.downloadData !== undefined && file.downloadData !== null ? (
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
        <Tooltip label={state === "uploading" || state === "downloading" ? "Cancel" : "Remove"}>
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
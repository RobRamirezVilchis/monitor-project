import { ComponentType, Dispatch, MouseEventHandler, ReactNode, SetStateAction, useRef, useState } from "react";
import { ActionIcon, Loader, Progress, Tooltip, ThemeIcon } from "@mantine/core";
import { useUncontrolled } from "@mantine/hooks";
import clsx from "clsx";
import dynamic from "next/dynamic";

import { useIsomorphicLayoutEffect, useOnMount, useOnUnmount } from "@/hooks/shared";
import { Dropzone, type DropzoneProps } from "./Dropzone";
import { formatBytes, sleep } from "@/utils/utils";

import styles from "./FileUploader.module.css";

import {
  IconCheck,
  IconCloudDownload,
  IconCloudUpload,
  IconFile,
  IconRefresh,
  IconX,
} from "@tabler/icons-react";

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

export interface FileUploaderProps<D = any> extends DropzoneProps, FileUploaderConfig<D>, FileUploaderClickCallbacks {
  value?: FileDetails<D>[];
  defaultValue?: FileDetails<D>[];
  onChange?: (value: FileDetails<D>[]) => void;
  error?: ReactNode;
}

export type IconConstructor = ComponentType<{ width?: string | number; height?: string | number; size?: string | number; className?: string; }>;

export type IconMapping = Record<string, IconConstructor>;

export interface FileUploaderConfig<D = any> {
  /** 
   * If true, files can be uploaded. 
   * @default true
   */
  allowUpload?: boolean;
  /** 
   * If true, files can be downloaded. 
   * @default true
   */
  allowDownload?: boolean;
  /**
   * If true, files will be uploaded as soon as they are dropped.
   * 
   * WARNING: This will also affect initial files if the `file` property is set!
   * @default false
   */
  autoUpload?: boolean;
  /** If true, the upload progress will be shown. */
  showUploadProgress?: boolean;
  /** If true, the download progress will be shown. */
  showDownloadProgress?: boolean;
  /**
   * The duration in milliseconds to show the success icon after a successful upload/download.
   * @default 750
   */
  successDuration?: number;
  /**
   * Time in milliseconds to wait before showing the success icon after a successful upload/download.
   */
  successDelay?: number;
  /**
   * Tooltips for the action icons.
   * If not set, the default tooltips will be used.
   */
  actionTooltips?: {
    upload?: string;
    download?: string;
    cancel?: string;
    retry?: string;
    remove?: string;
  };
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
  /**
   * File icons to be shown for each of the supported file types.
   * The key is the file mime type and the value is the icon to show.
   * The key can be a file extension (i.e. ".pdf"), a complete mime type (i.e. "application/pdf") 
   * or a partial mime type (i.e. "pdf"), in order of priority.
   */
  icons?: IconMapping;
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

  allowUpload = true,
  allowDownload = true,
  autoUpload = false,
  showUploadProgress = true,
  showDownloadProgress = true,
  successDuration = 750,
  successDelay = 750,
  actionTooltips,
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

            allowUpload={allowUpload}
            allowDownload={allowDownload}
            autoUpload={autoUpload}
            showUploadProgress={showUploadProgress}
            showDownloadProgress={showDownloadProgress}
            successDuration={successDuration}
            successDelay={successDelay}
            actionTooltips={actionTooltips}
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

            icons={props.icons}
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

  allowUpload = true,
  allowDownload = true,
  autoUpload = false,
  showUploadProgress = true,
  showDownloadProgress = true,
  successDuration = 750,
  successDelay = 750,
  actionTooltips,
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

  icons,
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
        timeoutRef.current = setTimeout(() => setState("idle"), successDuration);
        break;
    }
  }, [state, successDuration]);

  const uploadFile = async () => {
    if (!allowUpload) {
      setState("upload-error");
      onFileUploadError?.(file as FileUploadDetails<D>, {
        code: "upload-not-allowed",
        message: "Upload not allowed",
      });
      return;
    }

    if (!file.file) {
      setState("upload-error");
      onFileUploadError?.(file as FileUploadDetails<D>, {
        code: "file-not-found",
        message: `File ${file.name} not found`,
      });
      return;
    }

    setState("uploading");
    abortController.current = new AbortController();
    const signal = abortController.current.signal;
    try {
      const data = await uploadFn?.(file as FileUploadDetails<D>, signal, setProgress);
      if (successDelay > 0) await sleep(successDelay);
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
    if (!allowDownload) {
      setState("download-error");
      onFileDownloadError?.(file as FileDownloadDetails<D>, {
        code: "download-not-allowed",
        message: "Download not allowed",
      });
      return;
    }

    if (file.downloadData === undefined || file.downloadData === null) {
      setState("download-error");
      onFileDownloadError?.(file as FileDownloadDetails<D>, {
        code: "download-not-allowed",
        message: `File ${file.name} does not allow download`,
      });
      return;
    }

    setState("downloading");
    abortController.current = new AbortController();
    const signal = abortController.current.signal;
    try {
      const data = await downloadFn?.(file as FileDownloadDetails<D>, signal, setProgress);
      if (successDelay > 0) await sleep(successDelay);
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

  const FileIcon = getFileIconConstructor(file, icons);

  return (  
    <div
      className={clsx("flex items-center gap-2", styles["file-root"], {
        "border !border-red-500 !text-red-400": state === "upload-error" || state === "download-error",
      })}
    >
      <FileIcon width={32} height={32} size={32} className={clsx({
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

      {allowUpload && state === "idle" && file?.file && file.downloadData === undefined ? (
        <Tooltip label={actionTooltips?.upload || "Upload"}>
          <ActionIcon radius="xl" variant="light"
            onClick={_onFileUploadClick}
          >
            <IconCloudUpload />
          </ActionIcon>
        </Tooltip>
      ) : null}

      {allowDownload && state === "idle" && file.downloadData !== undefined && file.downloadData !== null ? (
        <Tooltip label={actionTooltips?.download || "Download"}>
          <ActionIcon radius="xl" variant="light"
            onClick={_onFileDownloadClick}
          >
            <IconCloudDownload />
          </ActionIcon>
        </Tooltip>
      ) : null}

      {state === "upload-error" || state === "download-error" ? (
        <Tooltip label={actionTooltips?.retry || "Retry"}>
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
        <Tooltip 
          label={
            state === "uploading" || state === "downloading" 
            ? (actionTooltips?.cancel || "Cancel")
            : (actionTooltips?.remove || "Remove")
          }
        >
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

export function getFileIconConstructor(
  file: FileDetails,
  iconsMapping?: IconMapping,
  defaultIcon: IconConstructor = IconFile
): IconConstructor {
  const extension = file.name.substring(file.name.lastIndexOf("."));
  const mimeType = file.type;
  const type = mimeType.split("/")[0];

  const Icon = 
    iconsMapping?.[extension]
    ?? iconsMapping?.[mimeType]
    ?? iconsMapping?.[type]
    ?? defaultFileIcons[extension]
    ?? defaultFileIcons[mimeType]
    ?? defaultFileIcons[type]
    ?? defaultIcon;
  return Icon;
}

const loadingIcon = () => <IconFile width={32} height={32} size={32} className="text-gray-400" />;

const defaultFileIcons: IconMapping = {
  image: dynamic(() => import("@tabler/icons-react").then(m => m.IconPhoto), { loading: loadingIcon, }),
  "image/bmp": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypeBmp), { loading: loadingIcon, }),
  "image/svg+xml": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypeSvg), { loading: loadingIcon, }),
  audio: dynamic(() => import("@tabler/icons-react").then(m => m.IconHeadphones), { loading: loadingIcon, }),
  video: dynamic(() => import("@tabler/icons-react").then(m => m.IconVideo), { loading: loadingIcon, }),
  font: dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypography), { loading: loadingIcon, }),
  "application/vnd.ms-fontobject": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypography), { loading: loadingIcon, }),
  "application/pdf": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypePdf), { loading: loadingIcon, }),
  "application/msword": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypeDoc), { loading: loadingIcon, }),
  "application/vnd.ms-word": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypeDocx), { loading: loadingIcon, }),
  "application/vnd.oasis.opendocument.text": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypeDocx), { loading: loadingIcon, }),
  "application/vnd.openxmlformats-officedocument.wordprocessingml": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypeDocx), { loading: loadingIcon, }),
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypeDocx), { loading: loadingIcon, }),
  "application/vnd.ms-excel": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypeXls), { loading: loadingIcon, }),
  "application/vnd.openxmlformats-officedocument.spreadsheetml": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypeXls), { loading: loadingIcon, }),
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypeXls), { loading: loadingIcon, }),
  "application/vnd.oasis.opendocument.spreadsheet": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypeXls), { loading: loadingIcon, }),
  "application/vnd.ms-powerpoint": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypePpt), { loading: loadingIcon, }),
  "application/vnd.openxmlformats-officedocument.presentationml": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypePpt), { loading: loadingIcon, }),
  "application/vnd.oasis.opendocument.presentation": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypePpt), { loading: loadingIcon, }),
  "text/csv": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypeCsv), { loading: loadingIcon, }),
  "text/plain": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypeTxt), { loading: loadingIcon, }),
  "text/html": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypeHtml), { loading: loadingIcon, }),
  "text/css": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypeCss), { loading: loadingIcon, }),
  "text/javascript": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypeJs), { loading: loadingIcon, }),
  "text/xml": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypeXml), { loading: loadingIcon, }),
  "application/xml": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypeXml), { loading: loadingIcon, }),
  ".jsx": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypeJs), { loading: loadingIcon, }),
  ".ts": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypeTs), { loading: loadingIcon, }),
  ".tsx": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypeTsx), { loading: loadingIcon, }),
  ".vue": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypeVue), { loading: loadingIcon, }),
  "application/json": dynamic(() => import("@tabler/icons-react").then(m => m.IconJson), { loading: loadingIcon, }),
  "application/sql": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypeSql), { loading: loadingIcon, }),
  "application/gzip": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileZip), { loading: loadingIcon, }),
  "application/vnd.rar": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileZip), { loading: loadingIcon, }),
  "application/zip": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileZip), { loading: loadingIcon, }),
  "application/object": dynamic(() => import("@tabler/icons-react").then(m => m.IconFile3d), { loading: loadingIcon, }),
  "application/vnd.sqlite3": dynamic(() => import("@tabler/icons-react").then(m => m.IconDatabase), { loading: loadingIcon, }),
  ".mdb": dynamic(() => import("@tabler/icons-react").then(m => m.IconDatabase), { loading: loadingIcon, }),
  ".mdf": dynamic(() => import("@tabler/icons-react").then(m => m.IconDatabase), { loading: loadingIcon, }),
  ".sdf": dynamic(() => import("@tabler/icons-react").then(m => m.IconDatabase), { loading: loadingIcon, }),
  ".db": dynamic(() => import("@tabler/icons-react").then(m => m.IconDatabase), { loading: loadingIcon, }),
  ".myd": dynamic(() => import("@tabler/icons-react").then(m => m.IconDatabase), { loading: loadingIcon, }),
  "application/x-php": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypePhp), { loading: loadingIcon, }),
  "application/octet-stream": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileDigit), { loading: loadingIcon, }),
  "application/x-sh": dynamic(() => import("@tabler/icons-react").then(m => m.IconBrandPowershell), { loading: loadingIcon, }),
};

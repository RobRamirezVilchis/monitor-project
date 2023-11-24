import { useLayoutEffect, useState } from "react";
import { ActionIcon, Loader, Progress, Tooltip, ThemeIcon } from "@mantine/core";

import type { FileDetails } from "./FileDetails";
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
import { useIsomorphicLayoutEffect } from "@/hooks/shared";

export interface FileUploaderProps extends DropzoneProps {

}

export const FileUploader = ({
  ...props
}: FileUploaderProps) => {
  const [files, setFiles] = useImmer<FileDetails[]>([{
    name: "test.txt",
    size: 50000,
    type: "text/plain",
  }]);

  return (
    <div className="flex flex-col gap-4">
      <Dropzone 
        {...props}
        onDropAccepted={(files, event) => {
          setFiles((draft) => {
            draft.push(...files);
          });
          props.onDropAccepted?.(files, event);
        }}
      />

      <div className="flex flex-col gap-2">
        {files.map((file, index) => (
          <FileUploaderItem key={index} file={file} />
        ))}
      </div>
    </div>
  );
};


interface FileUploaderItemProps {
  file: FileDetails;
}

type FileUploadState = "idle" | "uploading" | "downloading" | "success" | "error";

const FileUploaderItem = ({
  file,
}: FileUploaderItemProps) => {
  const [state, setState] = useState<FileUploadState>("idle");

  useIsomorphicLayoutEffect(() => {
    switch (state) {
      case "success":
        setTimeout(() => {
          setState("idle");
        }, 1000);
        break;
    }
  }, [state]);

  return (<>
    <div
      className={clsx("flex items-center gap-2", styles["file-root"])}
    >
      <IconFile size={36} className="text-gray-400" />

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

          {state === "uploading" || state === "downloading" ? <span>25%</span> : null}
        </div>

        {state === "uploading" || state === "downloading" ? <Progress size="sm" value={25} /> : null}
      </div>

      {state === "idle" ? (
        <Tooltip label="Upload">
          <ActionIcon radius="xl" variant="light">
            <IconCloudUpload />
          </ActionIcon>
        </Tooltip>
      ) : null}

      {state === "idle" ? (
        <Tooltip label="Download">
          <ActionIcon radius="xl" variant="light">
            <IconCloudDownload />
          </ActionIcon>
        </Tooltip>
      ) : null}

      {state === "error" ? (
        <Tooltip label="Retry">
          <ActionIcon radius="xl" variant="light">
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
          <ActionIcon radius="xl" variant="light" color="red">
            <IconX />
          </ActionIcon>
        </Tooltip>
      ) : null}
    </div>
    
    <div className="flex gap-2">
      <ActionIcon radius="xl" onClick={() => setState("idle")}>
        I
      </ActionIcon>

      <ActionIcon radius="xl" onClick={() => setState("uploading")}>
        U
      </ActionIcon>

      <ActionIcon radius="xl" onClick={() => setState("downloading")}>
        D
      </ActionIcon>

      <ActionIcon radius="xl" onClick={() => setState("success")}>
        S
      </ActionIcon>

      <ActionIcon radius="xl" onClick={() => setState("error")}>
        E
      </ActionIcon>
    </div>
  </>);
}
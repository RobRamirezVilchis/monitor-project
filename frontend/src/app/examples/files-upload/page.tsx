"use client";

import { DropzoneRef } from "react-dropzone";
import { Button, Divider } from "@mantine/core";
import { useRef } from "react";

import { AxiosError } from "axios";
import { ColorSchemeButtonToggle } from "@/components/shared";
import { downloadFileFromApi } from "@/utils/utils";
import { FileUploader } from "@/ui/base/files/FileUploader";
import { Id } from "@/api/types";
import { showErrorNotification } from "@/ui/notifications";
import http from "@/api/http";

const FileUploadPage = () => {
  const dropzoneRef = useRef<DropzoneRef>(null);

  const disabled = false;

  return (
    <div className="p-8">
      <ColorSchemeButtonToggle />

      <div className="w-full max-w-xl">
        <FileUploader<{ id: Id }>
          dropzoneRef={dropzoneRef}
          noClick
          // autoUpload
          maxSize={1024 * 1024 * 10}
          successDelay={750}
          disabled={disabled}
          classNames={{
            dropzone: {
              content: {
                root: "flex flex-col gap-4",
              },
            },
          }}
          showPreview
          previewProps={{
            h: 124,
            w: 124,
          }}
          defaultValue={[
            {
              name: "test.txt",
              size: 1024,
              type: "text/plain",
              downloadData: {
                id: 3,
              },
            }
          ]}
          onDropRejected={files => {
            console.log("onDropRejected:", files);
            const message = JSON.stringify(files.map(file => file.errors.map(error => error.message)), null, 2);
            showErrorNotification({
              title: "File upload error",
              message,
            });
          }}
          uploadFn={async (file, signal, setProgress) => {
            const formData = new FormData();
            formData.append("file", file.file);
            try {
              const resp = await http.post(
                "api/v1/files/upload/standard/", 
                formData, {
                  signal,
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                  onUploadProgress: (event) => {
                    setProgress(Math.round(event.loaded * 100 / (event.total || 1)));
                  },
                }
              );
              return resp.data as { id: string };
            }
            catch (error) {
              throw error;
            }
          }}
          downloadFn={async (file, signal, setProgress) => {
            const { data } = await http.get(
              `api/v1/files/${file.downloadData.id}/download/`,
              {
                signal,
                responseType: "blob",
                onDownloadProgress: (event) => {
                  setProgress(Math.round(event.loaded * 100 / (event.total || 1)));
                },
              }
            );
            downloadFileFromApi(data, file.name);
            return data;
          }}
          onFileUpload={(file, data) => {
            console.log("onFileUpload:", file, data);
          }}
          onFileUploadError={(file, error) => {
            console.log("onFileUploadError:", file, error);
            if (error?.code === AxiosError.ERR_CANCELED) return;
            if (error?.code === AxiosError.ERR_BAD_RESPONSE) {
              showErrorNotification({
                title: "File upload error",
                message: "An error ocurred, please try again later",
              });
              return;
            }
            showErrorNotification({
              title: "File upload error",
              message: error?.response?.data ? error.response.data.errors[0].detail : "Unknown error",
            });
          }}
          onFileDownload={(file, data: any) => {
            console.log("onFileDownload:", file, data);
          }}
          onFileDownloadError={(file, error) => {
            console.log("onFileDownloadError:", file, error);
            showErrorNotification({
              title: "File download error",
              message: error.response.data.errors[0].detail,
            });
          }}
          onFileRemoved={(file) => {
            console.log("onRemoveFile:", file);
          }}
          // showDownloadProgress={false}
        >
          <Divider label="or" />

          <div className="flex justify-center">
            <Button
                disabled={disabled}
                onClick={() => {
                dropzoneRef.current?.open?.();
              }}
            >
              Upload files
            </Button>
          </div>
        </FileUploader>
      </div>
    </div>
  )
}

export default FileUploadPage;

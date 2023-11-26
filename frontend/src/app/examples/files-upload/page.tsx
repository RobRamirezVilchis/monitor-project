"use client";

import { DropzoneRef } from "react-dropzone";
import { Button, Divider } from "@mantine/core";
import { useRef } from "react";

import { FileUploader } from "@/ui/base/files/FileUploader";
import { ColorSchemeButtonToggle } from "@/components/shared";
import { FileInput } from "@/ui/base/files/FileInput";
import http from "@/api/http";
import { downloadFileFromApi, sleep } from "@/utils/utils";

const FileUploadPage = () => {
  const dropzoneRef = useRef<DropzoneRef>(null);

  return (
    <div className="p-8">
      <ColorSchemeButtonToggle />

      <div className="w-full max-w-xl">
        <FileUploader
          dropzoneRef={dropzoneRef}
          noClick
          // autoUpload
          classNames={{
            content: {
              root: "flex flex-col gap-4",
            }
          }}
          uploadFn={(file, signal, setProgress) => {
            if (!file.file) return Promise.reject("No file");
            const formData = new FormData();
            formData.append("file", file.file);
            return http.post(
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
          }}
          downloadFn={async (file, signal, setProgress) => {
            const { data } = await http.get(
              `media/files/${"0b9e9241c75b47e4b96b968424c407ac.jpg"}`,
              {
                signal,
                responseType: "blob",
                onDownloadProgress: (event) => {
                  setProgress(Math.round(event.loaded * 100 / (event.total || 1)));
                },
              }
            );
            return data;
          }}
          onFileUpload={(file, data) => {
            console.log("onFileUpload:", file, data);
          }}
          onFileUploadError={(file, error) => {
            console.log("onFileUploadError:", file, error);
          }}
          onFileDownload={(file, data: any) => {
            console.log("onFileDownload:", file, data);
            downloadFileFromApi(data, file.name);
          }}
          onFileDownloadError={(file, error) => {
            console.log("onFileDownloadError:", file, error);
          }}
          onRemoveFile={(file) => {
            console.log("onRemoveFile:", file);
          }}
          // showDownloadProgress={false}
        >
          <Divider label="or" />

          <div className="flex justify-center">
            <Button
              onClick={() => dropzoneRef.current?.open()}
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

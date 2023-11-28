import { ComponentType, ReactNode } from "react";
import dynamic, { DynamicOptions } from "next/dynamic";

import { 
  IconFile,
} from "@tabler/icons-react";

const fileIcons: Record<string, ComponentType> = {
  // Media
  image: dynamic(() => import("@tabler/icons-react").then(m => m.IconFile), { loading: () => <IconFile />, }),
  audio: dynamic(() => import("@tabler/icons-react").then(m => m.IconFile), { loading: () => <IconFile />, }),
  video: dynamic(() => import("@tabler/icons-react").then(m => m.IconFile), { loading: () => <IconFile />, }),
  // Documents
  "application/pdf": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypePdf), { loading: () => <IconFile />, }),
  "application/msword": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypeDocx), { loading: () => <IconFile />, }),
  "application/vnd.ms-word": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypeDocx), { loading: () => <IconFile />, }),
  "application/vnd.oasis.opendocument.text": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypeDocx), { loading: () => <IconFile />, }),
  "application/vnd.openxmlformats-officedocument.wordprocessingml": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypeDocx), { loading: () => <IconFile />, }),
  "application/vnd.ms-excel": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypeXls), { loading: () => <IconFile />, }),
  "application/vnd.openxmlformats-officedocument.spreadsheetml": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypeXls), { loading: () => <IconFile />, }),
  "application/vnd.oasis.opendocument.spreadsheet": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypeXls), { loading: () => <IconFile />, }),
  "application/vnd.ms-powerpoint": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypePpt), { loading: () => <IconFile />, }),
  "application/vnd.openxmlformats-officedocument.presentationml": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypePpt), { loading: () => <IconFile />, }),
  "application/vnd.oasis.opendocument.presentation": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypePpt), { loading: () => <IconFile />, }),
  "text/plain": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypeTxt), { loading: () => <IconFile />, }),
  "text/html": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileTypeHtml), { loading: () => <IconFile />, }),
  "application/json": dynamic(() => import("@tabler/icons-react").then(m => m.IconFile), { loading: () => <IconFile />, }),
  // Archives
  "application/gzip": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileZip), { loading: () => <IconFile />, }),
  "application/zip": dynamic(() => import("@tabler/icons-react").then(m => m.IconFileZip), { loading: () => <IconFile />, }),
}

export function getFileIconConstructor<T>(mimeType: string): ComponentType<T> {
  console.log("mime:", mimeType);
  console.log(1, fileIcons[mimeType]);
  console.log(2, fileIcons[mimeType.split("/")[0]]);
  let Icon = fileIcons[mimeType]
    ?? fileIcons[mimeType.split("/")[0]]
    ?? IconFile;
  return Icon as ComponentType<T>;
}

"use client";

import clsx from "clsx";

import styles from "./useDataGrid.module.css";

import { es } from "@/ui/data-grid/locales/es";
import { useDataGrid as _useDataGrid } from "@/ui/mantine-data-grid/useDataGrid";

export const useDataGrid: typeof _useDataGrid = (options) => _useDataGrid({
  localization: es,
  styles: {
    row: {
      root: {
        border: "none",
      },
    },
  },
  classNames: {
    root: "h-full !border-none",
    mainContainer: "rounded-lg shadow-md",
    footerContainer: "!border-none",
    columnHeaders: {
      root: clsx(styles.columnHeaders, "!border-none"),
    },
    columnHeadersCell: {
      root: "text-white",
      label: "!font-normal !text-sm !font-semibold",
    },
    body: {
      root: styles.body,
    },
    row: {
      root: clsx("border-b border-white", styles["row-root"]),
    },
    toolbarContainer: "justify-end",
    toolbar: {
      root: "!pt-2.5",
    },
    footer: {
      root: "pt-1",
    },
  },
  globalFilterFn: "fuzzy",
  columnResizeMode: "onChange",
  enableColumnActions: true,
  enableGlobalFilter: true,
  globalFilterDebounceTime: 500,
  pageSizeOptions: [25, 50, 100],
  enableMultiSort: false,
  isMultiSortEvent: e => (e as MouseEvent).ctrlKey,
  
  slotProps: {
    baseTextInput: {
      classNames: {
        input: "rounded-none border-t-0 border-l-0 border-r-0 border-b border-b-2 !bg-transparent",
      },
    } as any,
  },
  ...options,
});

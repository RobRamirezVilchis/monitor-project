"use client";

import { useComputedColorScheme, useMantineTheme } from "@mantine/core";
import clsx from "clsx";

import styles from "./useDataGrid.module.css";

import { es } from "@/ui/data-grid/locales/es";
import { useDataGrid as _useDataGrid } from "@/ui/mantine-data-grid/useDataGrid";

export const useDataGrid: typeof _useDataGrid = (options) => {
  const theme = useMantineTheme();
  const colorScheme = useComputedColorScheme("light");

  return _useDataGrid({
    localization: es,
    styles: {
      columnHeaders: {
        root: {
          backgroundColor: colorScheme === "dark" ? theme.colors.dark[9] : theme.colors.dark[8],
          borderBottom: "none"
        },
      },
      body: {
        root: {
          backgroundColor: colorScheme === "dark" ? theme.colors.dark[6] : theme.white,
        },
      },
      row: {
        root: {
          border: "none",
        },
      },
    },
    classNames: {
      root: "h-full !border-none",
      mainContainer: "rounded shadow-md",
      footerContainer: "!border-none",
      columnHeadersCell: {
        root: "text-white",
        label: "!font-normal !text-sm !font-semibold",
        // actions: "bg-neutral-800 !text-white",
      },
      row: {
        root: clsx("border-b border-white", styles["row-root"]),
      },
      toolbarContainer: "justify-end",
      footer: {
        root: "pt-1",
      },
    },
    globalFilterFn: "fuzzy",
    columnResizeMode: "onChange",
    enableColumnActions: true,
    enableGlobalFilter: true,
    globalFilterDebounceTime: 1000,
    pageSizeOptions: [25, 50, 100],
    
    slotProps: {
      baseTextInput: {
        classNames: {
          input: "rounded-none border-t-0 border-l-0 border-r-0 border-b border-b-2",
        },
      } as any,
      // baseIconButton: {
      //   c: "inherit",
      // },
    },
    ...options,
  });
}
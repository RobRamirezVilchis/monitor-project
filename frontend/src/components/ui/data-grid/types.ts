import { 
    Table, 
    RowData, 
    TableOptions
} from "@tanstack/react-table";
import { RefObject } from "react";

export type DataGridDensity = "compact" | "normal" | "comfortable";

export interface DataGridOptions<TData extends RowData>
  extends Omit<TableOptions<TData>, "getCoreRowModel" | "getSortedRowModel" | "getExpandedRowModel" | "getFilteredRowModel" | "getFacetedRowModel" | "getFacetedMinMaxValues" | "getFacetedUniqueValues" | "getGroupedRowModel" | "getPaginationRowModel"> {
  enableFacetedValues?: boolean;
  enablePagination?: boolean;
}

export interface DataGridInstance<TData extends RowData> extends Table<TData> {
  refs: {
    content: {
      main: RefObject<HTMLDivElement>;
    },
    columnHeader: {
      main: RefObject<HTMLDivElement>;
    },
    header: RefObject<HTMLDivElement>;
    footer: RefObject<HTMLDivElement>;
  }
}
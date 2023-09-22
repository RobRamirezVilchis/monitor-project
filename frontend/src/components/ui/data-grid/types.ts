import { 
  Table, 
  RowData, 
  TableOptions
} from "@tanstack/react-table";
import { CSSProperties } from "react";

export type DataGridDensity = "compact" | "normal" | "comfortable";

export interface DataGridOptions<TData extends RowData>
  extends Omit<TableOptions<TData>, "getCoreRowModel" | "getSortedRowModel" | "getExpandedRowModel" | "getFilteredRowModel" | "getFacetedRowModel" | "getFacetedMinMaxValues" | "getFacetedUniqueValues" | "getGroupedRowModel" | "getPaginationRowModel"> {
  enableFacetedValues?: boolean;
  enablePagination?: boolean;
}

export interface DataGridInstance<TData extends RowData> extends Table<TData> {
  
}

export interface DataGridHeaderClassNames {
  root?: string;
}

export interface DataGridHeaderStyles {
  root?: CSSProperties;
}

export interface DataGridFooterClassNames {
  root?: string;
}

export interface DataGridFooterStyles {
  root?: CSSProperties;
}

export interface DataGridColumnHeadersClassNames {
  root?: string;
  container?: string;
}

export interface DataGridColumnHeadersStyles {
  root?: CSSProperties;
  container?: CSSProperties;
}

export interface DataGridColumnHeaderGroupClassNames {
  root?: string;
}

export interface DataGridColumnHeaderGroupStyles {
  root?: CSSProperties;
}

export interface DataGridColumnHeaderCellClassNames {
  root?: string;
  content?: string;
  contentLabel?: string;
  label?: string;
  actions?: string;
  filter?: string;
}

export interface DataGridColumnHeaderCellStyles {
  root?: CSSProperties;
  content?: CSSProperties;
  label?: CSSProperties;
  actions?: CSSProperties;
  filters?: CSSProperties;
}

export interface DataGridBodyClassNames {
  root?: string;
  viewport?: string;
  container?: string;
}

export interface DataGridBodyStyles {
  root?: CSSProperties;
  viewport?: CSSProperties;
  container?: CSSProperties;
}

export interface DataGridRowClassNames {
  root?: string;
}

export interface DataGridRowStyles {
  root?: CSSProperties;
}

export interface DataGridRowCellPropsClassNames {
  root?: string;
  content?: string;
}

export interface DataGridRowCellPropsStyles {
  root?: CSSProperties;
  content?: CSSProperties;
}

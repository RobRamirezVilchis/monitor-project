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
  headersContainer?: string;
  headerRow?: string;
  headerCell?: string;
}

export interface DataGridColumnHeadersStyles {
  root?: CSSProperties;
  headersContainer?: CSSProperties;
  headerRow?: CSSProperties;
  headerCell?: CSSProperties;
}

export interface DataGridBodyClassNames {
  root?: string;
  viewport?: string;
  rowsContainer?: string;
}

export interface DataGridBodyStyles {
  root?: CSSProperties;
  viewport?: CSSProperties;
  rowsContainer?: CSSProperties;
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

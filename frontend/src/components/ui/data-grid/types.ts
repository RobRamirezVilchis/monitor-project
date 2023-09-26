import {
  Cell as _Cell,
  ColumnDef as _ColumnDef,
  Column as _Column,
  RowData, 
  RequiredKeys,
  Updater,
  CoreOptions as _CoreOptions,
  Header as _Header,
  HeaderGroup as _HeaderGroup,
  VisibilityOptions,
  RowSelectionOptions,
  PaginationOptions as _PaginationOptions,
  ColumnSizingOptions,
  ExpandedOptions,
  GroupingOptions,
  SortingOptions,
  FiltersOptions,
  ColumnPinningOptions,
  ColumnOrderOptions,
  PartialKeys,
  CoreInstance as _CoreInstance,
  HeadersInstance as _HeaderInstance,
  VisibilityInstance as _VisibilityInstance,
  ColumnOrderInstance,
  ColumnPinningInstance as _ColumnPinningInstance,
  FiltersInstance as _FiltersInstance,
  SortingInstance as _SortingInstance,
  GroupingInstance as _GroupingInstance,
  ColumnSizingInstance,
  ExpandedInstance as _ExpandedInstance,
  PaginationInstance as _PaginationInstance,
  RowSelectionInstance as _RowSelectionInstance,
  Row as _Row,
  RowModel as _RowModel,
} from "@tanstack/react-table";
import { CSSProperties, ReactNode, RefObject } from "react";
import { UseScrollReturn } from "./components/useScroll";
import { Virtualizer, VirtualizerOptions } from "@tanstack/react-virtual";

export type DataGridDensity = "compact" | "normal" | "comfortable";

// Cell ------------------------------------------------------------------------

export interface Cell<TData extends RowData, TValue = unknown> extends 
Omit<_Cell<TData, TValue>,
  | "column"
  | "row"
> {
  row: Row<TData>;
  column: Column<TData, TValue>;
}

// Row -------------------------------------------------------------------------

export interface Row<TData extends RowData> extends 
Omit<_Row<TData>, 
  | "subRows"
  | "getLeafRows"
  | "getAllCells"
  | "getParentRow"
  | "getParentRows"
  | "getVisibleCells"
  | "getLeftVisibleCells"
  | "getCenterVisibleCells"
  | "getRightVisibleCells"
> {
  subRows: Row<TData>[];
  getLeafRows: () => Row<TData>[];
  getAllCells: () => Cell<TData, unknown>[];
  getParentRow: () => Row<TData> | undefined;
  getParentRows: () => Row<TData>[];
  getVisibleCells: () => Cell<TData, unknown>[];
  getLeftVisibleCells: () => Cell<TData, unknown>[];
  getCenterVisibleCells: () => Cell<TData, unknown>[];
  getRightVisibleCells: () => Cell<TData, unknown>[];
}

export interface RowModel<TData extends RowData> {
  rows: Row<TData>[];
  flatRows: Row<TData>[];
  rowsById: Record<string, Row<TData>>;
}

// ColumnDef -------------------------------------------------------------------

export type ColumnDef<TData extends RowData, TValue = unknown> = _ColumnDef<TData, TValue> & {
  customColDef?: boolean;
}

// Column ----------------------------------------------------------------------

export interface Column<TData extends RowData, TValue = unknown> extends 
Omit<_Column<TData, TValue>,
  | "columnDef"
  | "columns"
  | "parent"
  | "getFlatColumns"
  | "getLeafColumns"
  | "getFacetedRowModel"
> {
  columnDef: ColumnDef<TData, TValue>;
  columns: Column<TData, TValue>[];
  parent?: Column<TData, TValue>;
  getFlatColumns: () => Column<TData, TValue>[];
  getLeafColumns: () => Column<TData, TValue>[];
  getFacetedRowModel: () => RowModel<TData>;
}

// Header ----------------------------------------------------------------------

export interface Header<TData extends RowData, TValue = unknown> extends 
Omit<_Header<TData, TValue>,
  | "column"
  | "headerGroup"
  | "subHeaders"
  | "getLeafHeaders"
> {
  column: Column<TData, TValue>;
  headerGroup: HeaderGroup<TData>;
  subHeaders: Header<TData, TValue>[];
  getLeafHeaders: () => Header<TData, unknown>[];
}

export interface HeaderGroup<TData extends RowData> extends 
Omit<_HeaderGroup<TData>,
  | "headers"
>{
  headers: Header<TData, unknown>[];
}

// DataGrid Options -------------------------------------------------------------

export interface CoreOptions<TData extends RowData> extends Omit<_CoreOptions<TData>, "columns" | "defaultColumn"> {
  columns: ColumnDef<TData, any>[];
  defaultColumn?: Partial<ColumnDef<TData, unknown>>;
}

export interface PaginationOptions extends _PaginationOptions {
  enablePagination?: boolean;
}

export interface FacetedValuesOptions {
  enableFacetedValues?: boolean;
}

export interface VirtualizationOptions {
  enableRowsVirtualization?: boolean;
  rowsVirtualizerProps?: Partial<VirtualizerOptions<HTMLDivElement, Element>>;
  enableColumnsVirtualization?: boolean;
  columnsVirtualizerProps?: Partial<VirtualizerOptions<HTMLDivElement, Element>>;
}

interface FeatureOptions<TData extends RowData> extends 
VisibilityOptions, 
ColumnOrderOptions, 
ColumnPinningOptions, 
FiltersOptions<TData>, 
SortingOptions<TData>, 
GroupingOptions, 
ExpandedOptions<TData>, 
ColumnSizingOptions, 
PaginationOptions, 
RowSelectionOptions<TData>,
FacetedValuesOptions,
VirtualizationOptions {}

export type DataGridOptionsResolved<TData extends RowData> = CoreOptions<TData> & FeatureOptions<TData>;

export interface DataGridOptions<TData extends RowData> extends 
PartialKeys<DataGridOptionsResolved<TData>, "getCoreRowModel" | "state" | "onStateChange" | "renderFallbackValue"> {
  loading?: boolean;
  /**
   * The height of each row in pixels.
   * @default "normal" (52px)
   */
  density?: DataGridDensity;
  classNames?: {
    root?: string;
    header?: DataGridHeaderClassNames,
    columnHeaders?: DataGridColumnHeadersClassNames,
    columnHeaderGroup?: DataGridColumnHeaderGroupClassNames,
    columnHeaderCell?: DataGridColumnHeaderCellClassNames,
    body?: DataGridBodyClassNames,
    footer?: DataGridFooterClassNames,
    row?: DataGridRowClassNames;
    cell?: DataGridRowCellPropsClassNames;
  };
  styles?: {
    root?: CSSProperties;
    header?: DataGridHeaderStyles;
    columnHeaders?: DataGridColumnHeadersStyles;
    columnHeaderGroup?: DataGridColumnHeaderGroupStyles;
    columnHeaderCell?: DataGridColumnHeaderCellStyles;
    body?: DataGridBodyStyles;
    footer?: DataGridFooterStyles;
    row?: DataGridRowStyles;
    cell?: DataGridRowCellPropsStyles;
  };
  renderSubComponent?: (row: Row<TData>) => ReactNode
}

// DataGrid Instance ------------------------------------------------------------

export interface CoreInstance<TData extends RowData> extends 
Omit<_CoreInstance<TData>,
  | "options"
  | "setOptions"
  | "getCoreRowModel"
  | "getRowModel"
  | "getRow"
  | "getAllColumns"
  | "getAllFlatColumns"
  | "getAllLeafColumns"
  | "getColumn"
> {
  options: RequiredKeys<DataGridOptions<TData>, "state">;
  setOptions: (newOptions: Updater<DataGridOptionsResolved<TData>>) => void;
  getCoreRowModel: () => RowModel<TData>;
  getRowModel: () => RowModel<TData>;
  getRow: (id: string) => Row<TData>;
  getAllColumns: () => Column<TData, unknown>[];
  getAllFlatColumns: () => Column<TData, unknown>[];
  getAllLeafColumns: () => Column<TData, unknown>[];
  getColumn: (columnId: string) => Column<TData, unknown> | undefined;
}

export interface HeadersInstance<TData extends RowData> extends 
Omit<_HeaderInstance<TData>,
  | "getHeaderGroups"
  | "getLeftHeaderGroups"
  | "getCenterHeaderGroups"
  | "getRightHeaderGroups"
  | "getFooterGroups"
  | "getLeftFooterGroups"
  | "getCenterFooterGroups"
  | "getRightFooterGroups"
  | "getFlatHeaders"
  | "getLeftFlatHeaders"
  | "getCenterFlatHeaders"
  | "getRightFlatHeaders"
  | "getLeafHeaders"
  | "getLeftLeafHeaders"
  | "getCenterLeafHeaders"
  | "getRightLeafHeaders"
> {
  getHeaderGroups: () => HeaderGroup<TData>[];
  getLeftHeaderGroups: () => HeaderGroup<TData>[];
  getCenterHeaderGroups: () => HeaderGroup<TData>[];
  getRightHeaderGroups: () => HeaderGroup<TData>[];
  getFooterGroups: () => HeaderGroup<TData>[];
  getLeftFooterGroups: () => HeaderGroup<TData>[];
  getCenterFooterGroups: () => HeaderGroup<TData>[];
  getRightFooterGroups: () => HeaderGroup<TData>[];
  getFlatHeaders: () => Header<TData, unknown>[];
  getLeftFlatHeaders: () => Header<TData, unknown>[];
  getCenterFlatHeaders: () => Header<TData, unknown>[];
  getRightFlatHeaders: () => Header<TData, unknown>[];
  getLeafHeaders: () => Header<TData, unknown>[];
  getLeftLeafHeaders: () => Header<TData, unknown>[];
  getCenterLeafHeaders: () => Header<TData, unknown>[];
  getRightLeafHeaders: () => Header<TData, unknown>[];
}

export interface VisibilityInstance<TData extends RowData> extends
Omit<_VisibilityInstance<TData>,
  | "getVisibleFlatColumns"
  | "getVisibleLeafColumns"
  | "getLeftVisibleLeafColumns"
  | "getRightVisibleLeafColumns"
  | "getCenterVisibleLeafColumns"
> {
  getVisibleFlatColumns: () => Column<TData, unknown>[];
  getVisibleLeafColumns: () => Column<TData, unknown>[];
  getLeftVisibleLeafColumns: () => Column<TData, unknown>[];
  getRightVisibleLeafColumns: () => Column<TData, unknown>[];
  getCenterVisibleLeafColumns: () => Column<TData, unknown>[];
}

export interface ColumnPinningInstance<TData extends RowData> extends 
Omit<_ColumnPinningInstance<TData>,
  | "getLeftLeafColumns"
  | "getRightLeafColumns"
  | "getCenterLeafColumns"
> {
  getLeftLeafColumns: () => Column<TData, unknown>[];
  getRightLeafColumns: () => Column<TData, unknown>[];
  getCenterLeafColumns: () => Column<TData, unknown>[];
}

export interface FiltersInstance<TData extends RowData> extends 
Omit<_FiltersInstance<TData>,
  | "getPreFilteredRowModel"
  | "getFilteredRowModel"
  | "getGlobalFacetedRowModel"
> {
  getPreFilteredRowModel: () => RowModel<TData>;
  getFilteredRowModel: () => RowModel<TData>;
  getGlobalFacetedRowModel: () => RowModel<TData>;
}

export interface SortingInstance<TData extends RowData> extends
Omit<_SortingInstance<TData>,
  | "getPreSortedRowModel"
  | "getSortedRowModel"
> {
  getPreSortedRowModel: () => RowModel<TData>;
  getSortedRowModel: () => RowModel<TData>;
}

export interface GroupingInstance<TData extends RowData> extends
Omit<_GroupingInstance<TData>,
  | "getPreGroupedRowModel"
  | "getGroupedRowModel"
> {
  getPreGroupedRowModel: () => RowModel<TData>;
  getGroupedRowModel: () => RowModel<TData>;
}

export interface ExpandedInstance<TData extends RowData> extends
Omit<_ExpandedInstance<TData>,
  | "getPreExpandedRowModel"
  | "getExpandedRowModel"
> {
  getPreExpandedRowModel: () => RowModel<TData>;
  getExpandedRowModel: () => RowModel<TData>;
}

export interface PaginationInstance<TData extends RowData> extends
Omit<_PaginationInstance<TData>,
  | "getPrePaginationRowModel"
  | "getPaginationRowModel"
> {
  getPrePaginationRowModel: () => RowModel<TData>;
  getPaginationRowModel: () => RowModel<TData>;
}

export interface RowSelectionInstance<TData extends RowData> extends
Omit<_RowSelectionInstance<TData>,
  | "getPreSelectedRowModel"
  | "getSelectedRowModel"
  | "getFilteredSelectedRowModel"
  | "getGroupedSelectedRowModel"
> {
  getPreSelectedRowModel: () => RowModel<TData>;
  getSelectedRowModel: () => RowModel<TData>;
  getFilteredSelectedRowModel: () => RowModel<TData>;
  getGroupedSelectedRowModel: () => RowModel<TData>;
}

export type DataGridInstance<TData extends RowData> = 
& CoreInstance<TData>
& HeadersInstance<TData>
& VisibilityInstance<TData>
& ColumnOrderInstance<TData>
& ColumnPinningInstance<TData>
& FiltersInstance<TData>
& SortingInstance<TData>
& GroupingInstance<TData>
& ColumnSizingInstance
& ExpandedInstance<TData>
& PaginationInstance<TData>
& RowSelectionInstance<TData> 
& {
  refs: {
    content: {
      main: RefObject<HTMLDivElement>;
    };
    columnHeader: {
      main: RefObject<HTMLDivElement>;
    };
    header: RefObject<HTMLDivElement>;
    footer: RefObject<HTMLDivElement>;
  };
  scrolls: {
    main: {
      horizontal: RefObject<UseScrollReturn>;
      vertical: RefObject<UseScrollReturn>;
    };
    virtualizers: {
      columns: RefObject<Virtualizer<HTMLDivElement, Element> | null>;
      rows: RefObject<Virtualizer<HTMLDivElement, Element> | null>;
    }
  };
  density: {
    value: DataGridDensity;
    factor: number;
    rowHeight: number;
    headerHeight: number;
    toggle: (density?: DataGridDensity) => void;
  };
}

// Styles ----------------------------------------------------------------------

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

import { DistributiveOmit } from "@/utils/types";
import {
  BuiltInFilterFn as _BuiltInFilterFn,
  BuiltInSortingFn as _BuiltInSortingFn,
  Cell as _Cell,
  CellContext,
  Column as _Column,
  ColumnDef as _ColumnDef,
  ColumnOrderInstance,
  ColumnOrderOptions,
  ColumnPinningInstance as _ColumnPinningInstance,
  ColumnPinningOptions,
  ColumnSizingInstance,
  ColumnSizingOptions,
  CoreInstance as _CoreInstance,
  CoreOptions as _CoreOptions,
  ExpandedInstance as _ExpandedInstance,
  ExpandedOptions,
  FilterFnOption as _FilterFnOption,
  FiltersInstance as _FiltersInstance,
  FiltersOptions as _FiltersOptions,
  GroupColumnDef as _GroupColumnDef,
  GroupingInstance as _GroupingInstance,
  GroupingOptions,
  Header as _Header,
  HeaderGroup as _HeaderGroup,
  HeadersInstance as _HeaderInstance,
  InitialTableState as _InitialTableState,
  PaginationInstance as _PaginationInstance,
  PaginationOptions as _PaginationOptions,
  PartialKeys,
  RequiredKeys,
  Row as _Row,
  RowData, 
  RowModel as _RowModel,
  RowSelectionInstance as _RowSelectionInstance,
  RowSelectionOptions,
  SortDirection,
  SortingFnOption as _SortingFnOption,
  SortingInstance as _SortingInstance,
  SortingOptions,
  TableState as _TableState,
  Updater,
  VisibilityInstance as _VisibilityInstance,
  VisibilityOptions,
} from "@tanstack/react-table";
import { CSSProperties, Dispatch, ReactNode, RefObject, SetStateAction, MouseEvent } from "react";
import { Virtualizer, VirtualizerOptions } from "@tanstack/virtual-core";
import { 
  ActionIconProps, 
  ButtonProps, 
  CheckboxProps, 
  ComboboxData, 
  ElementProps,
  MenuItemProps, 
  SelectProps, 
  SwitchProps, 
  TextInputProps, 
  TooltipProps,
  MultiSelectProps,
  AutocompleteProps,
  NumberInputProps,
  TagsInputProps,
  RangeSliderProps,
} from "@mantine/core";
import { DateInputProps } from "@mantine/dates";

import { type FilterFnOption } from "./filterFns";
import { type SortingFnOption } from "./sortingFns";
import { UseScrollReturn } from "./components/useScroll";

export type DataGridDensity = "compact" | "normal" | "comfortable";

export type FilterVariant = 
  | "text"
  | "autocomplete"
  | "multi-autocomplete"
  | "select"
  | "multi-select"
  | "number"
  | "range"
  | "range-slider"
  | "date"
  | "date-range"
  | "checkbox";

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

export type GroupColumnDef<TData extends RowData, TValue = unknown> = Omit<_GroupColumnDef<TData, TValue>, "columns"> & {
  columns?: ColumnDef<TData, any>[];
}

export type ColumnDef<TData extends RowData, TValue = unknown> = 
DistributiveOmit<
  _ColumnDef<TData, TValue>, 
  | "filterFn"
  | "sortingFn"
>
& {
  accessorKey?: string;
  /**
   * Label used in menus and header cell's title attribute.
   */
  columnTitle?: string;
  /**
   * Label used as cell's title attribute. If not given, a title value will try to 
   * be rendered based on the cell's value. Useful when the cell's value is not a string.
   */
  cellTitle?: (cell: CellContext<TData, TValue>) => string;
  hideFromColumnsMenu?: boolean;
  enableReordering?: boolean;
  enableColumnActions?: boolean;
  columnActionsMenuItems?: (props: {
    instance: DataGridInstance<TData>;
    column: Column<TData, TValue>;
  }) => JSX.Element[];
  cellClassNames?: DataGridRowCellClassNames;
  cellStyles?: DataGridRowCellStyles;
  headerClassNames?: DataGridColumnHeadersCellClassNames;
  headerStyles?: DataGridColumnHeadersCellStyles;
  footerClassNames?: DataGridColumnFootersCellClassNames;
  footerStyles?: DataGridColumnFootersCellStyles;
  sortingFn?: _SortingFnOption<TData> | SortingFnOption | string & Record<never, never>;
  filterVariant?: FilterVariant;
  filterFn?: _FilterFnOption<TData> | FilterFnOption | string & Record<never, never>;
  filterProps?: {
    label?: string;
    placeholder?: string;
    options?: ComboboxData;
    min?: any;
    max?: any;
    step?: number;
  };
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

export interface CoreOptions<TData extends RowData> extends 
Omit<_CoreOptions<TData>, 
  | "columns" 
  | "defaultColumn"
  | "state"
  | "initialState"
> {
  columns: ColumnDef<TData, any>[];
  defaultColumn?: Partial<ColumnDef<TData, unknown>>;
  state?: Partial<TableState>;
  initialState?: InitialTableState;
}

export interface FiltersOptions<TData extends RowData> extends 
Omit<_FiltersOptions<TData>,
  "globalFilterFn"
> {
  globalFilterFn?: _FilterFnOption<TData> | FilterFnOption | string & Record<never, never>;
}

export interface ExtraTableState {
  loading?: boolean;
  /**
   * The height of each row in pixels.
   * @default "normal" (52px)
   */
  density: DataGridDensity;
  fullscreen: boolean;
  columnFiltersOpen: boolean;
}

export interface TableState extends _TableState, ExtraTableState {}

export interface InitialTableState extends _InitialTableState, Partial<ExtraTableState> {}

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
PartialKeys<DataGridOptionsResolved<TData>, "getCoreRowModel" | "onStateChange" | "renderFallbackValue"> {
  renderSubComponent?: (row: Row<TData>) => ReactNode;
  /**
   * Whether to enable column reordering.
   * @default false
   */
  enableColumnReordering?: boolean;
  /**
   * Whether to enable column actions.
   * @default false
   */
  enableColumnActions?: boolean;
  enableRowNumbering?: boolean;
  rowNumberingMode?: "original" | "static";

  hideToolbar?: boolean;
  hideQuickSearch?: boolean;
  hideColumnSelector?: boolean;
  hideDensitySelector?: boolean;
  hideFullscreenSelector?: boolean;
  hideFooter?: boolean;
  hideFooterPagination?: boolean;
  hideFooterSelectedRowCount?: boolean;
  hideColumnFiltersSelector?: boolean;

  localization?: Partial<DataGridLocalization>;
  slots?: {
    noRowsOverlay?: () => ReactNode;
    loadingOverlay?: () => ReactNode;
    toolbar?: (props: { instance: DataGridInstance<TData>; }) => ReactNode;
    pagination?: (props: { instance: DataGridInstance<TData>; }) => ReactNode;
  };
  slotProps?: {
    baseAutocompleteProps?: AutocompleteProps;
    baseTagsInputProps?: TagsInputProps;
    baseActionIconProps?: ActionIconProps & ElementProps<"button">;
    baseButtonProps?: ButtonProps & ElementProps<"button">;
    baseCheckboxProps?: CheckboxProps;
    baseMenuItemProps?: MenuItemProps & ElementProps<"button">;
    baseSelectProps?: SelectProps;
    baseMultiSelectProps?: MultiSelectProps;
    baseSwitchProps?: SwitchProps;
    baseTextInputProps?: TextInputProps;
    baseTooltipProps?: Omit<TooltipProps, "children" | "label">;
    baseNumberInputProps?: NumberInputProps;
    baseRangeSliderProps?: RangeSliderProps;
    baseDateInputProps?: DateInputProps;
    scroll?: {
      thickness?: number;
    }
  };

  onCellClick?: (cell: Cell<TData>, instance: DataGridInstance<TData>, event: MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onCellDoubleClick?: (cell: Cell<TData>, instance: DataGridInstance<TData>, event: MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onRowClick?: (row: Row<TData>, instance: DataGridInstance<TData>, event: MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onRowDoubleClick?: (row: Row<TData>, instance: DataGridInstance<TData>, event: MouseEvent<HTMLDivElement, MouseEvent>) => void;

  classNames?: {
    root?: string;
    toolbarContainer?: string;
    mainContainer?: string;
    footerContainer?: string;
    toolbar?: DataGridToolbarClassNames;
    columnHeaders?: DataGridColumnHeadersClassNames;
    columnHeadersGroup?: DataGridColumnHeadersGroupClassNames;
    columnHeadersCell?: DataGridColumnHeadersCellClassNames;
    columnFooters?: DataGridColumnFootersClassNames;
    columnFootersGroup?: DataGridColumnFootersGroupClassNames;
    columnFootersCell?: DataGridColumnFootersCellClassNames;
    body?: DataGridBodyClassNames;
    footer?: DataGridFooterClassNames;
    row?: DataGridRowClassNames;
    cell?: DataGridRowCellClassNames;
  };
  styles?: {
    root?: CSSProperties;
    toolbarContainer?: CSSProperties;
    mainContainer?: CSSProperties;
    footerContainer?: CSSProperties;
    toolbar?: DataGridToolbarStyles;
    columnHeaders?: DataGridColumnHeadersStyles;
    columnHeadersGroup?: DataGridColumnHeadersGroupStyles;
    columnHeadersCell?: DataGridColumnHeadersCellStyles;
    columnFooters?: DataGridColumnFootersStyles;
    columnFootersGroup?: DataGridColumnFootersGroupStyles;
    columnFootersCell?: DataGridColumnFootersCellStyles;
    body?: DataGridBodyStyles;
    footer?: DataGridFooterStyles;
    row?: DataGridRowStyles;
    cell?: DataGridRowCellStyles;
  };
}

// DataGrid Instance ------------------------------------------------------------

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
    root: RefObject<HTMLDivElement>;
    header: RefObject<HTMLDivElement>;
    columnsHeader: {
      main: {
        viewport: RefObject<HTMLDivElement>;
        content: RefObject<HTMLDivElement>;
      };
    };
    body: {
      main: {
        viewport: RefObject<HTMLDivElement>;
        content: RefObject<HTMLDivElement>;
      };
    };
    columnFooters: {
      main: {
        viewport: RefObject<HTMLDivElement>;
        content: RefObject<HTMLDivElement>;
      };
    };
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
  setLoading: Dispatch<SetStateAction<boolean>>;
  getDensityModel: () => {
    factor: number;
    rowHeight: number;
    headerHeight: number;
  };
  toggleDensity: (density?: DataGridDensity) => void;
  setFullscreen: (fullscreen: boolean) => void;
  setColumnFiltersOpen: Dispatch<SetStateAction<boolean>>;
  localization: DataGridLocalization;
}

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
  | "getState"
  | "setState"
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
  getState: () => TableState;
  setState: (updater: Updater<TableState>) => void;
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

// Localization ----------------------------------------------------------------

export interface DataGridLocalization {
  toolbarShowHideFilters: string;
  toolbarShowHideColumns: string;
  toolbarShowAllColumns: string;
  toolbarHideAllColumns: string;
  toolbarToggleDensity: string;
  toolbarToggleFullscreen: string;
  toolbarQuickFilterPlaceholder: string;
  
  columnPanelSortByLabel: (sortInfo: { 
    direction: SortDirection | false;
    nextDirection: SortDirection | false;
    column: Column<any, any>;
  }) => string;
  columnPanelDragHandleLabel: string;
  columnPanelMenuLabel: string;
  columnMenuSortByAscending: (column: Column<any, any>) => string;
  columnMenuSortByDescending: (column: Column<any, any>) => string;
  columnMenuClearSortBy: (column: Column<any, any>) => string;
  columnMenuHideColumn: string;
  
  paginationFirstPage: string;
  paginationLastPage: string;
  paginationPreviousPage: string;
  paginationNextPage: string;
  paginationLabelRowsPerPage: string;
  paginationLabelDisplayRows: (info: {
    from: number;
    to: number;
    count: number;
    page: number;
    pageCount: number;
  }) => string;
  
  expandRowLabel: string;
  expandAllRowsLabel: string;
  collapseRowLabel: string;
  collapseAllRowsLabel: string;
  noRowsLabel: string;
  noResultsOverlayLabel: string;
  loadingOverlayLabel: string;

  footerSelectedRowCount: (count: number) => string;

  filterByPlaceholder: (column: Column<any, any>) => string;
  filterByCheckboxLabel: (checked: boolean | undefined, column: Column<any, any>) => string;
  filterMinPlaceholder: string;
  filterMaxPlaceholder: string;
}

// Styles ----------------------------------------------------------------------

export interface DataGridToolbarClassNames {
  root?: string;
  content?: string;
  leftContainer?: string;
  rightContainer?: string;
}

export interface DataGridToolbarStyles {
  root?: CSSProperties;
  content?: CSSProperties;
  leftContainer?: CSSProperties;
  rightContainer?: CSSProperties;
}

export interface DataGridFooterClassNames {
  root?: string;
  rowSelection?: string;
  pagination?: string;
}

export interface DataGridFooterStyles {
  root?: CSSProperties;
  rowSelection?: CSSProperties;
  pagination?: CSSProperties;
}

export interface DataGridColumnHeadersClassNames {
  root?: string;
  container?: string;
}

export interface DataGridColumnHeadersStyles {
  root?: CSSProperties;
  container?: CSSProperties;
}

export interface DataGridColumnHeadersGroupClassNames {
  root?: string;
}

export interface DataGridColumnHeadersGroupStyles {
  root?: CSSProperties;
}

export interface DataGridColumnHeadersCellBaseClassNames {
  root?: string;
  content?: string;
  contentLabel?: string;
  label?: string;
}

export interface DataGridColumnHeadersCellClassNames extends DataGridColumnHeadersCellBaseClassNames {
  actions?: string;
  filter?: string;
  dragOverlay?: DataGridColumnHeadersCellBaseClassNames;
  dragIsOver?: DataGridColumnHeadersCellBaseClassNames;
}

export interface DataGridColumnHeadersCellStyles {
  root?: CSSProperties;
  content?: CSSProperties;
  contentLabel?: CSSProperties;
  label?: CSSProperties;
  actions?: CSSProperties;
  filters?: CSSProperties;
}

export interface DataGridColumnFootersClassNames {
  root?: string;
  container?: string;
}

export interface DataGridColumnFootersStyles {
  root?: CSSProperties;
  container?: CSSProperties;
}

export interface DataGridColumnFootersGroupClassNames {
  root?: string;
}

export interface DataGridColumnFootersGroupStyles {
  root?: CSSProperties;
}

export interface DataGridColumnFootersCellClassNames {
  root?: string;
  content?: string;
}

export interface DataGridColumnFootersCellStyles {
  root?: CSSProperties;
  content?: CSSProperties;
}

export interface DataGridBodyClassNames {
  root?: string;
  container?: string;
}

export interface DataGridBodyStyles {
  root?: CSSProperties;
  container?: CSSProperties;
}

export interface DataGridRowClassNames {
  root?: string;
  selected?: string;
}

export interface DataGridRowStyles {
  root?: CSSProperties;
  // selected?: CSSProperties;
}

export interface DataGridRowCellClassNames {
  root?: string;
  content?: string;
  focused?: string;
}

export interface DataGridRowCellStyles {
  root?: CSSProperties;
  content?: CSSProperties;
  // focused?: CSSProperties;
}

// Filters ---------------------------------------------------------------------


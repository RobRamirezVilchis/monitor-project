import { 
  RowData, 
  RequiredKeys,
  Updater,
  CoreOptions as _CoreOptions,
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
  HeadersInstance,
  VisibilityInstance,
  ColumnOrderInstance,
  ColumnPinningInstance,
  FiltersInstance,
  SortingInstance,
  GroupingInstance,
  ColumnSizingInstance,
  ExpandedInstance,
  PaginationInstance,
  RowSelectionInstance,
  Row,
} from "@tanstack/react-table";
import { CSSProperties, ReactNode, RefObject } from "react";
import { UseScrollReturn } from "./components/useScroll";
import { Virtualizer, VirtualizerOptions } from "@tanstack/react-virtual";

export type DataGridDensity = "compact" | "normal" | "comfortable";

export interface CoreOptions<TData extends RowData> extends _CoreOptions<TData> {}

export interface PaginationOptions extends _PaginationOptions {
  enablePagination?: boolean;
}

export interface FacetedValuesOptions {
  enableFacetedValues?: boolean;
}

export interface VirtualizationOptions {
  enableRowVirtualization?: boolean;
  rowVirtualizerProps?: Partial<VirtualizerOptions<HTMLDivElement, Element>>;
  enableColumnsVirtualization?: boolean;
  columnVirtualizerProps?: Partial<VirtualizerOptions<HTMLDivElement, Element>>;
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

export interface CoreInstance<TData extends RowData> extends 
Omit<_CoreInstance<TData>, "options" | "setOptions"> {
  options: RequiredKeys<DataGridOptions<TData>, "state">;
  setOptions: (newOptions: Updater<DataGridOptionsResolved<TData>>) => void;
}

export interface DataGridInstance<TData extends RowData> extends 
CoreInstance<TData>, 
HeadersInstance<TData>, 
VisibilityInstance<TData>, 
ColumnOrderInstance<TData>, 
ColumnPinningInstance<TData>, 
FiltersInstance<TData>, 
SortingInstance<TData>, 
GroupingInstance<TData>, 
ColumnSizingInstance, 
ExpandedInstance<TData>, 
PaginationInstance<TData>, 
RowSelectionInstance<TData> {
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

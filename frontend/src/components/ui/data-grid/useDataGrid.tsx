import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { 
  getCoreRowModel, 
  getExpandedRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowData,
  useReactTable, 
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";

import type { DataGridOptions, DataGridInstance, DataGridDensity, ColumnDef, TableState } from "./types";
import { useScroll } from "./components/useScroll";
import { createExpandableColumnDef, createRowNumberingColumnDef, createRowSelectionColumnDef } from "./reservedColumnDefs";
import { en } from "./locales/en";

export const densityFactor: Record<DataGridDensity, number> = {
  normal: 1,
  compact: 0.7,
  comfortable: 1.3,
};

const DENSITY_BASE_ROW_HEIGHT = 52;
const DENSITY_BASE_HEADER_HEIGHT = 56;

const useDataGrid = <TData extends RowData>(options: DataGridOptions<TData>): DataGridInstance<TData> => {
  const {
    columns: _columns,
    getCoreRowModel: _getCoreRowModel,
    getSortedRowModel: _getSortedRowModel,
    getExpandedRowModel: _getExpandedRowModel,
    getFilteredRowModel: _getFilteredRowModel,
    getFacetedRowModel: _getFacetedRowModel,
    getFacetedMinMaxValues: _getFacetedMinMaxValues,
    getFacetedUniqueValues: _getFacetedUniqueValues,
    getGroupedRowModel: _getGroupedRowModel,
    getPaginationRowModel: _getPaginationRowModel,
    initialState,
    state,
    ...tableOptions
  } = options;

  const columns = useMemo(() => {
    const internalColumns: ColumnDef<TData>[] = [];
    if (options.enableRowSelection)
      internalColumns.push(createRowSelectionColumnDef<TData>(options));
    if (options.enableExpanding)
      internalColumns.push(createExpandableColumnDef<TData>(options));
    if (options.enableRowNumbering)
      internalColumns.push(createRowNumberingColumnDef<TData>(options));

    return [
      ...internalColumns,
      ..._columns,
    ];
  }, [_columns, options]);

  const [loading, setLoading] = useState(options.initialState?.loading ?? options.state?.loading ?? false);
  const [density, setDensity] = useState<DataGridDensity>(options.initialState?.density ?? options.state?.density ?? "normal");
  const [fullscreen, setFullscreen] = useState(options.initialState?.fullscreen ?? options.state?.fullscreen ?? false);
  const [columnFiltersOpen, setColumnFiltersOpen] = useState(options.initialState?.columnFiltersOpen ?? options.state?.columnFiltersOpen ?? false);

  const instance = useReactTable<TData>({
    ...tableOptions,
    initialState: {
      ...initialState,
      loading: initialState?.loading ?? false,
      density: initialState?.density ?? "normal",
      fullscreen: initialState?.fullscreen ?? false,
      columnFiltersOpen: initialState?.columnFiltersOpen ?? false,
    },
    state: {
      loading,
      density,
      fullscreen,
      columnFiltersOpen,
      ...state,
    },
    columns,
    getCoreRowModel       : _getCoreRowModel            ?? getCoreRowModel<TData>(),
    getExpandedRowModel   : options.enableExpanding     ? _getExpandedRowModel    ?? getExpandedRowModel<TData>()    : undefined,
    getSortedRowModel     : options.enableSorting       ? _getSortedRowModel      ?? getSortedRowModel<TData>()      : undefined,
    getFilteredRowModel   : options.enableFilters       ? _getFilteredRowModel    ?? getFilteredRowModel<TData>()    : undefined,
    getFacetedRowModel    : options.enableFacetedValues ? _getFacetedRowModel     ?? getFacetedRowModel<TData>()     : undefined,
    getFacetedMinMaxValues: options.enableFacetedValues ? _getFacetedMinMaxValues ?? getFacetedMinMaxValues<TData>() : undefined,
    getFacetedUniqueValues: options.enableFacetedValues ? _getFacetedUniqueValues ?? getFacetedUniqueValues<TData>() : undefined,
    getGroupedRowModel    : options.enableGrouping      ? _getGroupedRowModel     ?? getGroupedRowModel<TData>()     : undefined,
    getPaginationRowModel : options.enablePagination    ? _getPaginationRowModel  ?? getPaginationRowModel<TData>()  : undefined,
  } as any) as unknown as DataGridInstance<TData>;

  const densityModel = useMemo(() => ({
    factor: densityFactor[density],
    rowHeight: Math.floor(DENSITY_BASE_ROW_HEIGHT * (densityFactor[density] ?? 1)),
    headerHeight: Math.floor(DENSITY_BASE_HEADER_HEIGHT * (densityFactor[density] ?? 1)),
  }), [density]);
  const getDensityModel = useMemo(() => () => densityModel, [densityModel]);
  const toggleDensity = useCallback<DataGridInstance<TData>["toggleDensity"]>((density) => {
    if (density) 
      setDensity(density);
    else {
      setDensity(prev => {
        switch (prev) {
          case "normal":      return "comfortable";
          case "compact":     return "normal";
          case "comfortable": return "compact";
        }
      });
    }
  }, []);

  const headerRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const mainColumnsHeaderRef = useRef<HTMLDivElement>(null);
  const mainColumnsFooterRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  const mainHorizontalScroll = useScroll({ orientation: "horizontal" });
  const mainVerticalScroll = useScroll({ orientation: "vertical" });
  const mainHorizontalScrollRef = useRef(mainHorizontalScroll);
  const mainVerticalScrollRef = useRef(mainVerticalScroll);

  const refs: DataGridInstance<TData>["refs"] = useMemo(() => ({
    content: {
      main: mainContentRef,
    },
    columnHeader: {
      main: mainColumnsHeaderRef,
    },
    columnFooter: {
      main: mainColumnsFooterRef,
    },
    header: headerRef,
    footer: footerRef,
  }), []);

  //* Virtualization cannot be changed after initialization!!!
  const leafColumns = instance.getVisibleLeafColumns();
  const horizontalVirtualizer = useVirtualizer(options.enableColumnsVirtualization ? {
    count: leafColumns.length,
    overscan: 1,
    getScrollElement: () => mainHorizontalScrollRef.current.scrollRef.current,
    estimateSize: i => leafColumns[i].getSize(),
    horizontal: true,
    ...options.columnsVirtualizerProps,
  } : {
    count: 0,
    getScrollElement: () => null,
    estimateSize: () => 0,
  });
  
  const verticalVirtualizer = useVirtualizer(options.enableRowsVirtualization ? {
    count: instance.getRowModel().rows.length,
    overscan: 1,
    getScrollElement: () => mainVerticalScrollRef.current.scrollRef.current,
    estimateSize: () => densityModel.rowHeight,
    horizontal: false,
    ...options.rowsVirtualizerProps,    
  } : {
    count: 0,
    getScrollElement: () => null,
    estimateSize: () => 0,
  });

  const prevDensityValue = useRef(density);
  useEffect(() => {
    if (prevDensityValue.current === density) return;
    prevDensityValue.current = density;
    verticalVirtualizer.measure();
  }, [density, verticalVirtualizer]);

  const horizontalVirtualizerRef = useRef(
    options.enableColumnsVirtualization ? horizontalVirtualizer : null
  );
  const verticalVirtualizerRef = useRef(
    options.enableRowsVirtualization ? verticalVirtualizer : null
  );

  const scrolls: DataGridInstance<TData>["scrolls"] = useMemo(() => ({
    main: {
      horizontal: mainHorizontalScrollRef,
      vertical: mainVerticalScrollRef,
    },
    virtualizers: {
      columns:  horizontalVirtualizerRef,
      rows: verticalVirtualizerRef,
    },
  }), []);

  const localization = useMemo(() => ({
    ...en,
    ...options.localization,
  }), [options.localization]);

  instance.refs = refs;
  instance.scrolls = scrolls;
  instance.setLoading = setLoading;
  instance.getDensityModel = getDensityModel;
  instance.toggleDensity = toggleDensity;
  instance.setFullscreen = setFullscreen;
  instance.setColumnFiltersOpen = setColumnFiltersOpen;
  instance.localization = localization;

  return instance;
}

export default useDataGrid;
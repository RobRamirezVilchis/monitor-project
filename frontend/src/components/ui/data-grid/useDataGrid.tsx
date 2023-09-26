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

import type { DataGridOptions, DataGridInstance, DataGridDensity } from "./types";
import { useEffect, useMemo, useRef, useState } from "react";
import { useScroll } from "./components/useScroll";
import { useVirtualizer } from "@tanstack/react-virtual";

export const densityFactor: Record<DataGridDensity, number> = {
  normal: 1,
  compact: 0.7,
  comfortable: 1.3,
};

const DENSITY_BASE_ROW_HEIGHT = 52;
const DENSITY_BASE_HEADER_HEIGHT = 56;

const useDataGrid = <TData extends RowData>({
  enableFacetedValues,
  getCoreRowModel: _getCoreRowModel,
  getSortedRowModel: _getSortedRowModel,
  getExpandedRowModel: _getExpandedRowModel,
  getFilteredRowModel: _getFilteredRowModel,
  getFacetedRowModel: _getFacetedRowModel,
  getFacetedMinMaxValues: _getFacetedMinMaxValues,
  getFacetedUniqueValues: _getFacetedUniqueValues,
  getGroupedRowModel: _getGroupedRowModel,
  getPaginationRowModel: _getPaginationRowModel,
  ...tableOptions
}: DataGridOptions<TData>): DataGridInstance<TData> => {
  const instance = useReactTable<TData>({
    ...tableOptions,
    getCoreRowModel       : _getCoreRowModel              ?? getCoreRowModel<TData>(),
    getExpandedRowModel   : tableOptions.enableExpanding  ? _getExpandedRowModel    ?? getExpandedRowModel<TData>()    : undefined,
    getSortedRowModel     : tableOptions.enableSorting    ? _getSortedRowModel      ?? getSortedRowModel<TData>()      : undefined,
    getFilteredRowModel   : tableOptions.enableFilters    ? _getFilteredRowModel    ?? getFilteredRowModel<TData>()    : undefined,
    getFacetedRowModel    : enableFacetedValues           ? _getFacetedRowModel     ?? getFacetedRowModel<TData>()     : undefined,
    getFacetedMinMaxValues: enableFacetedValues           ? _getFacetedMinMaxValues ?? getFacetedMinMaxValues<TData>() : undefined,
    getFacetedUniqueValues: enableFacetedValues           ? _getFacetedUniqueValues ?? getFacetedUniqueValues<TData>() : undefined,
    getGroupedRowModel    : tableOptions.enableGrouping   ? _getGroupedRowModel     ?? getGroupedRowModel<TData>()     : undefined,
    getPaginationRowModel : tableOptions.enablePagination ? _getPaginationRowModel  ?? getPaginationRowModel<TData>()  : undefined,
  }) as DataGridInstance<TData>;

  const headerRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const mainColumnsHeaderRef = useRef<HTMLDivElement>(null);
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
    header: headerRef,
    footer: footerRef,
  }), []);

  const [_density, _setDensity] = useState<DataGridDensity>(tableOptions.density ?? "normal");

  const density = useMemo(() => ({
    value: _density,
    factor: densityFactor[_density],
    rowHeight: Math.floor(DENSITY_BASE_ROW_HEIGHT * (densityFactor[_density] ?? 1)),
    headerHeight: Math.floor(DENSITY_BASE_HEADER_HEIGHT * (densityFactor[_density] ?? 1)),
    toggle: (density?: DataGridDensity) => {
      if (density) 
        _setDensity(density);
      else {
        _setDensity(prev => {
          switch (prev) {
            case "normal":      return "compact";
            case "compact":     return "comfortable";
            case "comfortable": return "normal";
          }
        });
      }
    },
  }), [_density]);

  //* Virtualization cannot be changed after initialization!!!
  const leafColumns = instance.getVisibleLeafColumns();
  const horizontalVirtualizer = useVirtualizer(tableOptions.enableColumnsVirtualization ? {
    count: leafColumns.length,
    overscan: 1,
    getScrollElement: () => mainHorizontalScrollRef.current.scrollRef.current,
    estimateSize: i => leafColumns[i].getSize(),
    horizontal: true,
    ...tableOptions.columnsVirtualizerProps,
  } : {
    count: 0,
    getScrollElement: () => null,
    estimateSize: () => 0,
  });
  
  const verticalVirtualizer = useVirtualizer(tableOptions.enableRowsVirtualization ? {
    count: instance.getRowModel().rows.length,
    overscan: 1,
    getScrollElement: () => mainVerticalScrollRef.current.scrollRef.current,
    estimateSize: () => density.rowHeight,
    horizontal: false,
    ...tableOptions.rowsVirtualizerProps,    
  } : {
    count: 0,
    getScrollElement: () => null,
    estimateSize: () => 0,
  });

  const prevDensityValue = useRef(density.value);
  useEffect(() => {
    if (prevDensityValue.current === density.value) return;
    prevDensityValue.current = density.value;
    verticalVirtualizer.measure();
  }, [density.value, verticalVirtualizer]);

  const horizontalVirtualizerRef = useRef(
    tableOptions.enableColumnsVirtualization ? horizontalVirtualizer : null
  );
  const verticalVirtualizerRef = useRef(
    tableOptions.enableRowsVirtualization ? verticalVirtualizer : null
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

  instance.refs = refs;
  instance.scrolls = scrolls;
  instance.density = density;

  return instance;
}

export default useDataGrid;
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

import type { DataGridOptions, DataGridInstance } from "./types";

const useDataGrid = <TData extends RowData>({
  enableFacetedValues,
  ...tableOptions
}: DataGridOptions<TData>): DataGridInstance<TData> => {
  const table = useReactTable<TData>({
    ...tableOptions,
    getCoreRowModel: getCoreRowModel<TData>(),
    getExpandedRowModel: tableOptions.enableExpanding ? getExpandedRowModel<TData>() : undefined,
    getSortedRowModel: tableOptions.enableSorting ? getSortedRowModel<TData>() : undefined,
    getFilteredRowModel: tableOptions.enableFilters ? getFilteredRowModel<TData>() : undefined,
    getFacetedRowModel: enableFacetedValues ? getFacetedRowModel<TData>() : undefined,
    getFacetedMinMaxValues: enableFacetedValues ? getFacetedMinMaxValues<TData>() : undefined,
    getFacetedUniqueValues: enableFacetedValues ? getFacetedUniqueValues<TData>() : undefined,
    getGroupedRowModel: tableOptions.enableGrouping ? getGroupedRowModel<TData>() : undefined,
    getPaginationRowModel: tableOptions.enablePagination ? getPaginationRowModel<TData>() : undefined,
  }) as DataGridInstance<TData>;

  return table;
}

export default useDataGrid;
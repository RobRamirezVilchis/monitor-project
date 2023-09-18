import { Table } from "@tanstack/react-table";

import { ScrollsProvider } from "./ScrollsProvider";
import DataGridBody from "./DataGridBody";
import DataGridColumnHeaders from "./DataGridColumnHeaders";
import DataGridFooter from "./DataGridFooter";
import DataGridHeader from "./DataGridHeader";
import ColumnVisibility from "./components/ColumnVisibility";

export interface DataGridProps<TData extends unknown> {
  table: Table<TData>;
}

const DataGrid = <TData extends unknown>({
  table,
}: DataGridProps<TData>) => {
  // TODO: Memoize a construct columns function for custom column definitions

  return (
    <ScrollsProvider>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
        className="border border-blue-500"
      >
        {/* Temp layout for header */}
        <div className="flex gap-2">
          <DataGridHeader />
          <div className="flex-1 flex justify-end">
            <ColumnVisibility table={table} />
          </div>
        </div>
        <DataGridColumnHeaders table={table} />
        <DataGridBody table={table} />
        <DataGridFooter />
      </div>
    </ScrollsProvider>
  );
};

export default DataGrid;


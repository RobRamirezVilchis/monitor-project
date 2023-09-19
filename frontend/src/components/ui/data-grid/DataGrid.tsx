import { Row, Table } from "@tanstack/react-table";

import { ScrollsProvider } from "./ScrollsProvider";
import DataGridBody from "./DataGridBody";
import DataGridColumnHeaders from "./DataGridColumnHeaders";
import DataGridFooter from "./DataGridFooter";
import DataGridHeader from "./DataGridHeader";
import ColumnVisibility from "./components/ColumnVisibility";
import QuickFilter from "./components/QuickFilter";
import DataGridBodyVirtualized from "./DataGridBodyVirtualized";
import DataGridColumnHeadersVirtualized from "./DataGridColumnHeadersVirtualized";

export interface DataGridProps<TData extends unknown> {
  table: Table<TData>;
  renderSubComponent?: (row: Row<TData>) => React.ReactNode;
}

const DataGrid = <TData extends unknown>({
  table, renderSubComponent,
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
          <div className="flex-1 flex justify-end items-end">
            <ColumnVisibility table={table} />
            <QuickFilter table={table} />
          </div>
        </div>
        <DataGridColumnHeaders table={table} />
        {/* <DataGridColumnHeadersVirtualized table={table} /> */}
        {/* <DataGridBody table={table} renderSubComponent={renderSubComponent} /> */}
        <DataGridBodyVirtualized table={table} renderSubComponent={renderSubComponent} />
        <DataGridFooter />
      </div>
    </ScrollsProvider>
  );
};

export default DataGrid;


import { RowData } from "@tanstack/react-table";
import clsx from "clsx";

import gridStyles from "./DataGrid.module.css";

import type { DataGridInstance } from "./types";
import DataGridBody from "./body/DataGridBody";
import DataGridColumnHeaders from "./column-headers/DataGridColumnHeaders";
import DataGridFooter from "./footer/DataGridFooter";
import DataGridHeader from "./header/DataGridHeader";

export interface DataGridProps<TData extends RowData> {
  instance: DataGridInstance<TData>;
}

const DataGrid = <TData extends RowData>({
  instance,
}: DataGridProps<TData>) => {

  return (
    <div className={clsx("DataGrid-root", gridStyles.root, instance.options.classNames?.root)} style={instance.options.styles?.root}>
      <DataGridHeader instance={instance} />
      <DataGridColumnHeaders instance={instance} />
      <DataGridBody
        instance={instance}
        loading={instance.options.loading}
      />
      <DataGridFooter instance={instance} />
    </div>
  );
};

export default DataGrid;

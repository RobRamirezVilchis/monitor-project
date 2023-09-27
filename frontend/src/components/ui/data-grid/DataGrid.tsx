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
    <div 
      className={clsx("DataGrid-root", gridStyles.root, { [gridStyles.fullscreen]: instance.fullscreen }, instance.options.classNames?.root)} 
      style={instance.options.styles?.root}
    >
      {instance.options.hideHeader ? null : <DataGridHeader instance={instance} />}
      <DataGridColumnHeaders instance={instance} />
      <DataGridBody
        instance={instance}
        loading={instance.options.loading}
      />
      {instance.options.hideFooter ? null : <DataGridFooter instance={instance} />}
    </div>
  );
};

export default DataGrid;

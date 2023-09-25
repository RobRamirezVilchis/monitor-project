import { RowData } from "@tanstack/react-table";
import clsx from "clsx";

import gridHeaderStyles from "./DataGridHeader.module.css";

import { useDataGridContext } from "../providers/DataGridContext";
import { useDataGridRefsContext } from "../providers/DataGridRefsProvider";
import ColumnVisibility from "../components/ColumnVisibility";
import QuickFilter from "../components/QuickFilter";
import type { DataGridInstance } from "../types";


import DensityToggle from "../components/DensityToggle";

export interface DataGridHeaderProps<TData extends RowData> {
  instance: DataGridInstance<TData>;
}

const DataGridHeader = <TData extends RowData>({
  instance,
}: DataGridHeaderProps<TData>) => {
  const { classNames, styles } = useDataGridContext();
  const { headerRef } = useDataGridRefsContext();

  return (
    <div
      ref={headerRef}
      className={clsx("DataGridHeader-root", gridHeaderStyles.root, classNames?.header?.root)}
      style={styles?.header?.root}
    >
      <div className="flex gap-2 w-full p-2 items-center">
        <div>
          <QuickFilter instance={instance} />
        </div>

        <div className="flex-1 flex justify-end items-center">
          <ColumnVisibility instance={instance} />
          <DensityToggle instance={instance} />
        </div>
      </div>
    </div>
  )
}

export default DataGridHeader;

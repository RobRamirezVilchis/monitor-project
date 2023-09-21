import { RowData } from "@tanstack/react-table";
import clsx from "clsx";

import gridHeaderStyles from "./DataGridHeader.module.css";

import { useDataGridContext } from "../providers/DataGridContext";
import { useDataGridRefsContext } from "../providers/DataGridRefsProvider";
import ColumnVisibility from "../components/ColumnVisibility";
import QuickFilter from "../components/QuickFilter";
import type { DataGridInstance } from "../types";

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
      <div className="flex-1 flex justify-end items-end">
        <ColumnVisibility instance={instance} />
        <QuickFilter instance={instance} />
      </div>
    </div>
  )
}

export default DataGridHeader;

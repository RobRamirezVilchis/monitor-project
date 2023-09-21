import { CSSProperties } from "react";
import { RowData } from "@tanstack/react-table";
import clsx from "clsx";

import gridHeaderStyles from "./DataGridHeader.module.css";

import type { DataGridInstance } from "./types";
import ColumnVisibility from "./components/ColumnVisibility";
import QuickFilter from "./components/QuickFilter";

export interface DataGridHeaderClassNames {
  root?: string;
}

export interface DataGridHeaderStyles {
  root?: CSSProperties;
}

export interface DataGridHeaderProps<TData extends RowData> {
  instance: DataGridInstance<TData>;
  classNames?: DataGridHeaderClassNames;
  styles?: DataGridHeaderStyles;
}

const DataGridHeader = <TData extends RowData>({
  instance,
  classNames,
  styles,
}: DataGridHeaderProps<TData>) => {
  return (
    <div
      className={clsx("DataGridHeader-root", gridHeaderStyles.root, classNames?.root)}
      style={styles?.root}
    >
      <div className="flex-1 flex justify-end items-end">
        <ColumnVisibility instance={instance} />
        <QuickFilter instance={instance} />
      </div>
    </div>
  )
}

export default DataGridHeader;

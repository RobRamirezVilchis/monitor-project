import { RowData } from "@tanstack/react-table";
import { ReactNode } from "react";
import clsx from "clsx";

import gridToolbarStyles from "./DataGridToolbar.module.css";

import { DataGridInstance } from "../../types";

export interface DataGridToolbarProps<TData extends RowData> {
  children?: ReactNode;
  instance: DataGridInstance<TData>;
}

const DataGridToolbar = <TData extends RowData>({
  children,
  instance,
}: DataGridToolbarProps<TData>) => {

  return (
    <div 
      className={clsx("DataGridToolbar-root", gridToolbarStyles.root, instance.options.classNames?.toolbar?.root)}
      style={instance.options.styles?.toolbar?.root}
    >
      {children}
    </div>
  );
}

export default DataGridToolbar;

import { RowData } from "@tanstack/react-table";
import { ReactNode } from "react";
import clsx from "clsx";

import { DataGridInstance } from "../../types";

import gridToolbarStyles from "./DataGridToolbar.module.css";

export interface DataGridToolbarLeftContentProps<TData extends RowData> {
  children?: ReactNode;
  instance: DataGridInstance<TData>;
}

const DataGridToolbarLeftContent = <TData extends RowData>({
  children,
  instance,
}: DataGridToolbarLeftContentProps<TData>) => {
  return (
    <div
    className={clsx("DataGridToolbar-left", gridToolbarStyles.left, instance.options.classNames?.toolbar?.left)}
    style={instance.options.styles?.toolbar?.left}
    >
      {children}
    </div>
  );
}

export default DataGridToolbarLeftContent;
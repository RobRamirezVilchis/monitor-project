import { RowData } from "@tanstack/react-table";
import { ReactNode } from "react";
import clsx from "clsx";

import { DataGridInstance } from "../../types";

import gridToolbarStyles from "./DataGridToolbar.module.css";

export interface DataGridToolbarRightContentProps<TData extends RowData> {
  children?: ReactNode;
  instance: DataGridInstance<TData>;
}

const DataGridToolbarRightContent = <TData extends RowData>({
  children,
  instance,
}: DataGridToolbarRightContentProps<TData>) => {
  return (
    <div
      className={clsx("DataGridToolbar-right", gridToolbarStyles.right, instance.options.classNames?.toolbar?.right)}
      style={instance.options.styles?.toolbar?.right}
    >
      {children}
    </div>
  );
}

export default DataGridToolbarRightContent;

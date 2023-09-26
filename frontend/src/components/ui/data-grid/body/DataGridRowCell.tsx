import { RowData, Cell, flexRender } from "@tanstack/react-table";
import clsx from "clsx";

import gridRowCellStyles from "./DataGridRowCell.module.css";

import { DataGridInstance } from "../types";
import { CSSProperties } from "react";

export interface DataGridRowCellProps<TData extends RowData, TValue> {
  instance: DataGridInstance<TData>;
  cell: Cell<TData, TValue>;
  style?: CSSProperties;
}

const DataGridRowCell = <TData extends RowData, TValue>({
  instance,
  cell,
  style,
}: DataGridRowCellProps<TData, TValue>) => {
  const value = cell.getValue();
  const title = typeof value === "string" || typeof value === "number"
    ? value.toString()
    : undefined;

  return (
    <div
      className={clsx("DataGridRowCell-root", gridRowCellStyles.root, instance.options.classNames?.cell?.root)}
      style={{
        ...instance.options.styles?.cell?.root,
        height: instance.density.rowHeight,
        minHeight: instance.density.rowHeight,
        maxHeight: instance.density.rowHeight,
        width: cell.column.getSize(),
        ...style,
      }}
      title={title}
    >
      <div
        className={clsx("DataGridRowCell-content", gridRowCellStyles.content, instance.options.classNames?.cell?.content)}
        style={instance.options.styles?.cell?.content}
      >
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
      </div>
    </div>
  )
}

export default DataGridRowCell;

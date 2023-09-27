import { CSSProperties } from "react";
import { RowData, flexRender } from "@tanstack/react-table";
import clsx from "clsx";

import gridRowCellStyles from "./DataGridRowCell.module.css";

import { Cell, DataGridInstance } from "../types";
import { ROW_NUMBER_COLUMN_ID } from "../reservedColumnDefs";

export interface DataGridRowCellProps<TData extends RowData, TValue> {
  instance: DataGridInstance<TData>;
  cell: Cell<TData, TValue>;
  rowIndex?: number;
  style?: CSSProperties;
}

const DataGridRowCell = <TData extends RowData, TValue>({
  instance,
  cell,
  rowIndex,
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
    >
      <div
        className={clsx("DataGridRowCell-content", gridRowCellStyles.content, instance.options.classNames?.cell?.content)}
        style={instance.options.styles?.cell?.content}
        title={title}
      >
        {instance.options.enableRowNumbering && cell.column.id === ROW_NUMBER_COLUMN_ID ? (
          instance.options.rowNumberingMode === "static" 
            ? (rowIndex !== undefined ? rowIndex + 1 : "#")
            : cell.row.index + 1
        ) : flexRender(cell.column.columnDef.cell, cell.getContext())}
      </div>
    </div>
  )
}

export default DataGridRowCell;

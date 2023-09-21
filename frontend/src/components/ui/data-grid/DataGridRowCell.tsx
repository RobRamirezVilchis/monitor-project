import { RowData, Cell, flexRender } from "@tanstack/react-table";
import { CSSProperties } from "react";
import clsx from "clsx";

import gridRowCellStyles from "./DataGridRowCell.module.css";

import type { DataGridDensity } from "./types";
import { densityFactor } from "./constants";

export interface DataGridRowCellPropsClassNames {
  root?: string;
  content?: string;
}

export interface DataGridRowCellPropsStyles {
  root?: CSSProperties;
  content?: CSSProperties;
}

export interface DataGridRowCellProps<TData extends RowData, TValue> {
  cell: Cell<TData, TValue>;
  density?: DataGridDensity;
  classNames?: DataGridRowCellPropsClassNames;
  styles?: DataGridRowCellPropsStyles;
}

const DataGridRowCell = <TData extends RowData, TValue>({
  cell,
  density = "normal",
  classNames,
  styles,
}: DataGridRowCellProps<TData, TValue>) => {

  const content = flexRender(cell.column.columnDef.cell, cell.getContext());
  const value = cell.getValue();
  const title = typeof value === "string" || typeof value === "number"
    ? value.toString()
    : undefined;

  const height = Math.floor(52 * (densityFactor[density] ?? 1));

  return (
    <div
      className={clsx("DataGridRowCell-root", gridRowCellStyles.root, classNames?.root)}
      style={{
        ...styles?.root,
        height,
        minHeight: height,
        maxHeight: height,
        width: cell.column.getSize(),
      }}
      title={title}
    >
      <div
        className={clsx("DataGridRowCell-content", gridRowCellStyles.content, classNames?.content)}
        style={styles?.content}
      >
        {content}
      </div>
    </div>
  )
}

export default DataGridRowCell;

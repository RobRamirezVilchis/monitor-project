import { RowData, Cell, flexRender } from "@tanstack/react-table";
import clsx from "clsx";

import gridRowCellStyles from "./DataGridRowCell.module.css";

import { useDataGridContext } from "../providers/DataGridContext";
import { useDataGridDensity } from "../providers/DensityContext";

export interface DataGridRowCellProps<TData extends RowData, TValue> {
  cell: Cell<TData, TValue>;
}

const DataGridRowCell = <TData extends RowData, TValue>({
  cell,
}: DataGridRowCellProps<TData, TValue>) => {
  const { classNames, styles } = useDataGridContext();
  const { rowHeight } = useDataGridDensity();
  
  const value = cell.getValue();
  const title = typeof value === "string" || typeof value === "number"
    ? value.toString()
    : undefined;

  return (
    <div
      className={clsx("DataGridRowCell-root", gridRowCellStyles.root, classNames?.cell?.root)}
      style={{
        ...styles?.cell?.root,
        height: rowHeight,
        minHeight: rowHeight,
        maxHeight: rowHeight,
        width: cell.column.getSize(),
      }}
      title={title}
    >
      <div
        className={clsx("DataGridRowCell-content", gridRowCellStyles.content, classNames?.cell?.content)}
        style={styles?.cell?.content}
      >
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
      </div>
    </div>
  )
}

export default DataGridRowCell;

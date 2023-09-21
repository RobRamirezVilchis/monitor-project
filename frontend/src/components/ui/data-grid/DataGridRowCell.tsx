import { RowData, Cell, flexRender } from "@tanstack/react-table";
import clsx from "clsx";

import gridRowCellStyles from "./DataGridRowCell.module.css";

import { useDataGridContext } from "./DataGridContext";
import { useDataGridDensity } from "./DensityContext";

export interface DataGridRowCellProps<TData extends RowData, TValue> {
  cell: Cell<TData, TValue>;
}

const DataGridRowCell = <TData extends RowData, TValue>({
  cell,
}: DataGridRowCellProps<TData, TValue>) => {
  const { classNames, styles } = useDataGridContext();
  const { height } = useDataGridDensity();
  
  const content = flexRender(cell.column.columnDef.cell, cell.getContext());
  const value = cell.getValue();
  const title = typeof value === "string" || typeof value === "number"
    ? value.toString()
    : undefined;

  return (
    <div
      className={clsx("DataGridRowCell-root", gridRowCellStyles.root, classNames?.cell?.root)}
      style={{
        ...styles?.cell?.root,
        height,
        minHeight: height,
        maxHeight: height,
        width: cell.column.getSize(),
      }}
      title={title}
    >
      <div
        className={clsx("DataGridRowCell-content", gridRowCellStyles.content, classNames?.cell?.content)}
        style={styles?.cell?.content}
      >
        {content}
      </div>
    </div>
  )
}

export default DataGridRowCell;

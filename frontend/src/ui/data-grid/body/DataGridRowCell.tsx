import { CSSProperties, FocusEventHandler, MouseEventHandler, useCallback } from "react";
import { RowData, flexRender } from "@tanstack/react-table";
import clsx from "clsx";

import styles from "./DataGridRowCell.module.css";

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
  const columnDef = cell.column.columnDef;
  const instanceClassNames = typeof instance.options.classNames?.cell === "function" 
    ? instance.options.classNames?.cell(cell as any) 
    : instance.options.classNames?.cell;
  const colDefClassNames = typeof columnDef.cellClassNames === "function"
    ? columnDef.cellClassNames(cell)
    : columnDef.cellClassNames;

  const onClick = useCallback<MouseEventHandler<HTMLDivElement>>((e) => {
    if (!instance.options.disableCellSelectionOnClick) {
      e.currentTarget.setAttribute("tabindex", "0");
      e.currentTarget.focus();
      e.currentTarget.classList.add("DataGridRowCell--focused");
      if (instanceClassNames?.focused)
        e.currentTarget.classList.add(instanceClassNames?.focused);
    }

    instance.options.onCellClick?.(cell as any, instance, e as any);
  }, [cell, instance, instanceClassNames?.focused]);

  const onDoubleClick = useCallback<MouseEventHandler<HTMLDivElement>>((e) => {
    instance.options.onCellDoubleClick?.(cell as any, instance, e as any);
  }, [cell, instance]);

  const onBlur = useCallback<FocusEventHandler<HTMLDivElement>>((e) => {
    e.currentTarget.setAttribute("tabindex", "-1");
    e.currentTarget.classList.remove("DataGridRowCell--focused");
    if (instanceClassNames?.focused)
      e.currentTarget.classList.remove(instanceClassNames?.focused);
  }, [instanceClassNames?.focused]);

  return (
    <div
      className={clsx("DataGridRowCell-root", styles.root, instanceClassNames?.root, colDefClassNames?.root)}
      style={{
        ...instance.options.styles?.cell?.root,
        ...columnDef.cellStyles?.root,
        height: instance.getDensityModel().rowHeight,
        minHeight: instance.getDensityModel().rowHeight,
        maxHeight: instance.getDensityModel().rowHeight,
        width: cell.column.getSize(),
        ...style,
      }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onBlur={onBlur}
      role="cell"
    >
      <div
        className={clsx("DataGridRowCell-content", styles.content, instanceClassNames?.content, colDefClassNames?.content)}
        style={{
          ...instance.options.styles?.cell?.content,
          ...columnDef.cellStyles?.content,
        }}
        title={columnDef?.cellTitle?.(cell.getContext()) || title}
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

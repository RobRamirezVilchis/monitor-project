import { CSSProperties, FocusEventHandler, MouseEventHandler, useCallback } from "react";
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
  const columnDef = cell.column.columnDef;

  const onClick = useCallback<MouseEventHandler<HTMLDivElement>>((e) => {
    e.currentTarget.setAttribute("tabindex", "0");
    e.currentTarget.focus();
    e.currentTarget.classList.add("DataGridRowCell--focused");
    if (instance.options.classNames?.cell?.focused)
      e.currentTarget.classList.add(instance.options.classNames?.cell?.focused);

    instance.options.onCellClick?.(cell as any, instance, e as any);
  }, [cell, instance]);

  const onDoubleClick = useCallback<MouseEventHandler<HTMLDivElement>>((e) => {
    instance.options.onCellDoubleClick?.(cell as any, instance, e as any);
  }, [cell, instance]);

  const onBlur = useCallback<FocusEventHandler<HTMLDivElement>>((e) => {
    e.currentTarget.setAttribute("tabindex", "-1");
    e.currentTarget.classList.remove("DataGridRowCell--focused");
    if (instance.options.classNames?.cell?.focused)
      e.currentTarget.classList.remove(instance.options.classNames?.cell?.focused);
  }, [instance]);

  return (
    <div
      className={clsx("DataGridRowCell-root", gridRowCellStyles.root, instance.options.classNames?.cell?.root, columnDef.cellClassNames?.root)}
      style={{
        ...instance.options.styles?.cell?.root,
        ...columnDef.cellStyles?.root,
        height: instance.density.rowHeight,
        minHeight: instance.density.rowHeight,
        maxHeight: instance.density.rowHeight,
        width: cell.column.getSize(),
        ...style,
      }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onBlur={onBlur}
      role="cell"
    >
      <div
        className={clsx("DataGridRowCell-content", gridRowCellStyles.content, instance.options.classNames?.cell?.content, columnDef.cellClassNames?.content)}
        style={{
          ...instance.options.styles?.cell?.content,
          ...columnDef.cellStyles?.content,
        }}
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

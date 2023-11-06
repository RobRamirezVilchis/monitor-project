import { CSSProperties, FocusEventHandler, useCallback } from "react";
import { RowData } from "@tanstack/react-table";
import clsx from "clsx";

import styles from "./DataGridRowCell.module.css";

import { DataGridInstance } from "../types";

export interface DataGridRowFillerCellProps<TData extends RowData> {
  instance: DataGridInstance<TData>;
  style?: CSSProperties;
}

const DataGridRowFillerCell = <TData extends RowData>({
  instance,
  style,
}: DataGridRowFillerCellProps<TData>) => {
  const instanceClassNames = typeof instance.options.classNames?.cell === "function" 
    ? instance.options.classNames?.cell(null) 
    : instance.options.classNames?.cell;

  const onBlur = useCallback<FocusEventHandler<HTMLDivElement>>((e) => {
    e.currentTarget.setAttribute("tabindex", "-1");
    e.currentTarget.classList.remove("DataGridRowCell--focused");
    if (instanceClassNames?.focused)
      e.currentTarget.classList.remove(instanceClassNames?.focused);
  }, [instanceClassNames?.focused]);

  return (
    <div
      className={clsx("DataGridRowCell-root DataGridRowFillerCell", styles.root, instanceClassNames?.root)}
      style={{
        ...instance.options.styles?.cell?.root,
        height: instance.getDensityModel().rowHeight,
        minHeight: instance.getDensityModel().rowHeight,
        maxHeight: instance.getDensityModel().rowHeight,
        ...style,
        width: "var(--dg-filler-cell-width, 0)",
        padding: 0,
      }}
      onBlur={onBlur}
      role="cell"
    >
      <div
        className={clsx("DataGridRowCell-content", styles.content, instanceClassNames?.content)}
        style={{
          ...instance.options.styles?.cell?.content,
          padding: 0,
        }}
      >
        
      </div>
    </div>
  )
}

export default DataGridRowFillerCell;

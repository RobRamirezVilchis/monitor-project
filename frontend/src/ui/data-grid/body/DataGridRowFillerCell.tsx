import { CSSProperties, FocusEventHandler, useCallback } from "react";
import { RowData } from "@tanstack/react-table";
import clsx from "clsx";

import styles from "./DataGridRowCell.module.css";

import { DataGridInstance } from "../types";

export interface DataGridRowFillerCellProps<TData extends RowData> {
  instance: DataGridInstance<TData>;
  width?: number;
  style?: CSSProperties;
}

const DataGridRowFillerCell = <TData extends RowData>({
  instance,
  width,
  style,
}: DataGridRowFillerCellProps<TData>) => {
  const onBlur = useCallback<FocusEventHandler<HTMLDivElement>>((e) => {
    e.currentTarget.setAttribute("tabindex", "-1");
    e.currentTarget.classList.remove("DataGridRowCell--focused");
    if (instance.options.classNames?.cell?.focused)
      e.currentTarget.classList.remove(instance.options.classNames?.cell?.focused);
  }, [instance]);

  return (
    <div
      className={clsx("DataGridRowCell-root DataGridRowFillerCell", styles.root, instance.options.classNames?.cell?.root)}
      style={{
        ...instance.options.styles?.cell?.root,
        height: instance.getDensityModel().rowHeight,
        minHeight: instance.getDensityModel().rowHeight,
        maxHeight: instance.getDensityModel().rowHeight,
        width,
        ...style,
        padding: 0,
      }}
      onBlur={onBlur}
      role="cell"
    >
      <div
        className={clsx("DataGridRowCell-content", styles.content, instance.options.classNames?.cell?.content)}
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

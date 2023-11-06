import { RowData } from "@tanstack/react-table";
import { CSSProperties, Fragment, MouseEventHandler, useCallback } from "react";
import clsx from "clsx";

import styles from "./DataGridRow.module.css";

import { DataGridInstance, Row } from "../types";
import DataGridRowCell from "./DataGridRowCell";
import DataGridRowFillerCell from "./DataGridRowFillerCell";

export interface DataGridRowProps<TData extends RowData> {
  instance: DataGridInstance<TData>;
  row: Row<TData>;
  rowIndex: number;
  style?: CSSProperties;
  /**
   * The offset of the row from the top of the viewport.
   * Experimental, only used when rows virtualization is enabled.
   * RowSubComponents are experimental when rows virtualization is enabled.
   * @default 0
   */
  vRowEnd?: number;
}

const DataGridRow = <TData extends RowData>({
  instance,
  row,
  rowIndex,
  style,
  vRowEnd = 0,
}: DataGridRowProps<TData>) => {
  const instanceClassNames = typeof instance.options.classNames?.row === "function"
    ? instance.options.classNames?.row(row as any)
    : instance.options.classNames?.row;

  const onClick = useCallback<MouseEventHandler<HTMLDivElement>>((e) => {
    instance.options.onRowClick?.(row as any, instance, e as any);
  }, [row, instance]);

  const onDoubleClick = useCallback<MouseEventHandler<HTMLDivElement>>((e) => {
    instance.options.onRowDoubleClick?.(row as any, instance, e as any);
  }, [row, instance]);

  return (
    <Fragment>
      <div
        className={clsx("DataGridRow-root", styles.root, {
          [`DataGridRow--selected ${styles["--selected"]} ${instanceClassNames?.selected}`]: row.getIsSelected(),
        }, instanceClassNames?.root)}
        style={{
          ...instance.options.styles?.row?.root,
          height: instance.getDensityModel().rowHeight,
          minHeight: instance.getDensityModel().rowHeight,
          maxHeight: instance.getDensityModel().rowHeight,
          width: instance.options.enableColumnsVirtualization
            ? instance.scrolls.virtualizers.columns.current?.getTotalSize()
            : instance.options.styles?.row?.root?.width,
          ...style,
        }}
        data-id={(row.original as any)?.id ?? undefined}
        data-row-index={rowIndex}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        role="row"
      >
        {/* Cells */}
        {instance.options.enableColumnsVirtualization
        ? instance.scrolls.virtualizers.columns?.current?.getVirtualItems().map(virtualColumn => {
          const cell = row.getCenterVisibleCells()[virtualColumn.index];
          return (
            <DataGridRowCell 
              key={cell.id}
              instance={instance}
              cell={cell}
              rowIndex={rowIndex}
              style={{
                height   : "100%",
                position : "absolute",
                transform: `translateX(${virtualColumn.start}px)`,
                // width    : virtualColumn.size,
              }}
            />
          )
        }) : row.getCenterVisibleCells().map(cell => (
          <DataGridRowCell 
            key={cell.id}
            instance={instance}
            cell={cell}
            rowIndex={rowIndex}
          />
        ))}
        
        <DataGridRowFillerCell
          instance={instance}
        />
      </div>

      {/* Expandable SubComponent */}
      {instance.options.enableExpanding && row.getCanExpand() && instance.options?.renderSubComponent && row.getIsExpanded() ? (
        <div
          style={{
            display: "flex",
            transform: instance.options.enableRowsVirtualization 
              ? `translateY(${vRowEnd}px)` 
              : undefined,
          }}
        >
          {instance.options.renderSubComponent(row)}
        </div>
      ) : null}
    </Fragment>
  )
}

export default DataGridRow;

import { RowData, Row } from "@tanstack/react-table";
import { CSSProperties, Fragment } from "react";
import clsx from "clsx";

import gridRowStyles from "./DataGridRow.module.css";

import { DataGridInstance } from "../types";
import DataGridRowCell from "./DataGridRowCell";

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
  const visibleCells = row.getVisibleCells();

  return (
    <Fragment>
      <div
        className={clsx("DataGridRow-root", gridRowStyles.root, instance.options.classNames?.row?.root)}
        style={{
          ...instance.options.styles?.row?.root,
          height: instance.density.rowHeight,
          minHeight: instance.density.rowHeight,
          maxHeight: instance.density.rowHeight,
          width: instance.options.enableColumnsVirtualization
            ? instance.scrolls.virtualizers.columns.current?.getTotalSize()
            : instance.options.styles?.row?.root?.width,
          ...style,
        }}
        data-id={(row.original as any)?.id ?? undefined}
        data-row-index={rowIndex}
      >
        {/* Cells */}
        {instance.options.enableColumnsVirtualization
        ? instance.scrolls.virtualizers.columns?.current?.getVirtualItems().map(virtualColumn => {
          const cell = visibleCells[virtualColumn.index];
          return (
            <DataGridRowCell 
              key={cell.id}
              instance={instance}
              cell={cell}
              style={{
                height   : "100%",
                position : "absolute",
                transform: `translateX(${virtualColumn.start}px)`,
                // width    : virtualColumn.size,
              }}
            />
          )
        }) : visibleCells.map(cell => (
          <DataGridRowCell 
            key={cell.id}
            instance={instance}
            cell={cell}
          />
        ))}
      </div>

      {/* Expandable SubComponent */}
      {instance.options?.renderSubComponent && row.getIsExpanded() ? (
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

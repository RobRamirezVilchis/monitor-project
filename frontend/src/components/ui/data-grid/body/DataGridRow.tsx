import { RowData } from "@tanstack/react-table";
import { CSSProperties, Fragment, MouseEventHandler, useCallback } from "react";
import clsx from "clsx";

import gridRowStyles from "./DataGridRow.module.css";

import { DataGridInstance, Row } from "../types";
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
  const onClick = useCallback<MouseEventHandler<HTMLDivElement>>((e) => {
    instance.options.onRowClick?.(row as any, instance, e as any);
  }, [row, instance]);

  const onDoubleClick = useCallback<MouseEventHandler<HTMLDivElement>>((e) => {
    instance.options.onRowDoubleClick?.(row as any, instance, e as any);
  }, [row, instance]);

  return (
    <Fragment>
      <div
        className={clsx("DataGridRow-root", gridRowStyles.root, {
          [`DataGridRow--selected ${gridRowStyles["--selected"]} ${instance.options.classNames?.row?.selected}`]: row.getIsSelected(),
        }, instance.options.classNames?.row?.root)}
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

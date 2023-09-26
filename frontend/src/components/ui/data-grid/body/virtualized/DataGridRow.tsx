import { RowData, Row } from "@tanstack/react-table";
import { CSSProperties, Fragment } from "react";
import clsx from "clsx";

import gridRowStyles from "./DataGridRow.module.css";

import { DataGridInstance } from "../../types";
import DataGridRowCell from "./DataGridRowCell";

export interface DataGridRowProps<TData extends RowData> {
  instance: DataGridInstance<TData>;
  row: Row<TData>;
  rowIndex: number;
  renderSubComponent?: (row: Row<TData>) => React.ReactNode;
  style?: CSSProperties;
}

const DataGridRow = <TData extends RowData>({
  instance,
  row,
  rowIndex,
  renderSubComponent,
  style,
}: DataGridRowProps<TData>) => {
  return (
    <Fragment>
      <div
        className={clsx("DataGridRow-root", gridRowStyles.root, instance.options.classNames?.row?.root)}
        style={{
          ...instance.options.styles?.row?.root,
          height: instance.density.rowHeight,
          minHeight: instance.density.rowHeight,
          maxHeight: instance.density.rowHeight,
          ...style,
        }}
        data-id={(row.original as any)?.id ?? undefined}
        data-row-index={rowIndex}
      >
        {/* Cells */}
        {instance.scrolls.virtualizers.columns.current?.getVirtualItems().map(virtualColumn => {
          const cell = row.getVisibleCells()[virtualColumn.index];
          return (
            <DataGridRowCell 
              key={cell.id}
              instance={instance}
              cell={cell}
              style={{
                width: `${virtualColumn.size}px`,
                position: "absolute",
                transform: `translateX(${virtualColumn.start}px)`,
                height: "100%",
              }}
            />
          )
        })}
      </div>

      {/* Expandable SubComponent */}
      {renderSubComponent && row.getIsExpanded() ? (
        <div
        style={{
          display: "flex",
        }}
      >
        {renderSubComponent(row)}
      </div>
      ) : null}
    </Fragment>
  )
}

export default DataGridRow;

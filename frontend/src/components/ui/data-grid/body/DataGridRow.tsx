import { RowData, Row } from "@tanstack/react-table";
import { Fragment } from "react";
import clsx from "clsx";

import gridRowStyles from "./DataGridRow.module.css";

import { DataGridInstance } from "../types";
import DataGridRowCell from "./DataGridRowCell";

export interface DataGridRowProps<TData extends RowData> {
  instance: DataGridInstance<TData>;
  row: Row<TData>;
  rowIndex: number;
  renderSubComponent?: (row: Row<TData>) => React.ReactNode;
}

const DataGridRow = <TData extends RowData>({
  instance,
  row,
  rowIndex,
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
        }}
        data-id={(row.original as any)?.id ?? undefined}
        data-row-index={rowIndex}
      >
        {/* Cells */}
        {row.getVisibleCells().map(cell => (
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
          }}
        >
          {instance.options.renderSubComponent(row)}
        </div>
      ) : null}
    </Fragment>
  )
}

export default DataGridRow;

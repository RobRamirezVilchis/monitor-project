import { RowData, Row } from "@tanstack/react-table";
import { Fragment } from "react";
import clsx from "clsx";

import gridRowStyles from "./DataGridRow.module.css";

import { useDataGridContext } from "./DataGridContext";
import { useDataGridDensity } from "./DensityContext";
import DataGridRowCell from "./DataGridRowCell";

export interface DataGridRowProps<TData extends RowData> {
  row: Row<TData>;
  rowIndex: number;
  renderSubComponent?: (row: Row<TData>) => React.ReactNode;
}

const DataGridRow = <TData extends RowData>({
  row,
  rowIndex,
  renderSubComponent,
}: DataGridRowProps<TData>) => {
  const { classNames, styles } = useDataGridContext();
  const { height } = useDataGridDensity();

  return (
    <Fragment key={row.id}>
      <div
        className={clsx("DataGridRow-root", gridRowStyles.root, classNames?.row?.root)}
        style={{
          ...styles?.row?.root,
          height,
          minHeight: height,
          maxHeight: height,
        }}
        data-id={(row.original as any)?.id ?? undefined}
        data-row-index={rowIndex}
      >
        {/* Cells */}
        {row.getVisibleCells().map(cell => (
          <DataGridRowCell 
            key={cell.id}
            cell={cell}
            // classNames={classNames?.row?.cell} 
            // styles={styles?.row?.cell} 
          />
        ))}
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

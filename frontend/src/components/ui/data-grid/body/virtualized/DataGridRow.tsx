import { RowData, Row } from "@tanstack/react-table";
import { CSSProperties, Fragment } from "react";
import clsx from "clsx";

import gridRowStyles from "./DataGridRow.module.css";

import { useDataGridContext } from "../../providers/DataGridContext";
import { useDataGridDensity } from "../../providers/DensityContext";
import DataGridRowCell from "./DataGridRowCell";

export interface DataGridRowProps<TData extends RowData> {
  row: Row<TData>;
  rowIndex: number;
  renderSubComponent?: (row: Row<TData>) => React.ReactNode;
  style?: CSSProperties;
}

const DataGridRow = <TData extends RowData>({
  row,
  rowIndex,
  renderSubComponent,
  style,
}: DataGridRowProps<TData>) => {
  const { classNames, styles } = useDataGridContext();
  const { rowHeight } = useDataGridDensity();

  return (
    <Fragment>
      <div
        className={clsx("DataGridRow-root", gridRowStyles.root, classNames?.row?.root)}
        style={{
          ...styles?.row?.root,
          height: rowHeight,
          minHeight: rowHeight,
          maxHeight: rowHeight,
          ...style,
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

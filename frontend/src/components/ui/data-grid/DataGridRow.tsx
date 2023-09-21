import { RowData, Row } from "@tanstack/react-table";
import { CSSProperties, Fragment } from "react";
import clsx from "clsx";

import gridRowStyles from "./DataGridRow.module.css";

import { DataGridDensity } from "./types";
import DataGridRowCell, { 
  type DataGridRowCellPropsClassNames,
  type DataGridRowCellPropsStyles,
} from "./DataGridRowCell";
import { densityFactor } from "./constants";

export interface DataGridRowClassNames {
  root?: string;
  cell?: DataGridRowCellPropsClassNames;
}

export interface DataGridRowStyles {
  root?: CSSProperties;
  cell?: DataGridRowCellPropsStyles;
}

export interface DataGridRowProps<TData extends RowData> {
  row: Row<TData>;
  density?: DataGridDensity;
  rowIndex: number;
  classNames?: DataGridRowClassNames;
  styles?: DataGridRowStyles;
  renderSubComponent?: (row: Row<TData>) => React.ReactNode;
}

const DataGridRow = <TData extends RowData>({
  row,
  density = "normal",
  rowIndex,
  classNames,
  styles,
  renderSubComponent,
}: DataGridRowProps<TData>) => {
  const height = Math.floor(52 * (densityFactor[density] ?? 1));

  return (
    <Fragment key={row.id}>
      <div
        className={clsx("DataGridRow-root", gridRowStyles.root, classNames?.root)}
        style={{
          ...styles?.root,
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
            density={density}
            classNames={classNames?.cell} 
            styles={styles?.cell} 
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

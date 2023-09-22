import { RowData, HeaderGroup } from "@tanstack/react-table";
import clsx from "clsx";

import gridHeaderGroupStyles from "./DataGridColumnHeaderGroup.module.css";

import { useDataGridContext } from "../providers/DataGridContext";
import { useDataGridDensity } from "../providers/DensityContext";
import DataGridColumnHeaderCell from "./DataGridColumnHeaderCell";
import DataGridColumnHeaderCellDnd from "./DataGridColumnHeaderCellDnd";

export interface DataGridColumnHeaderGroupProps<TData extends RowData> {
  group: HeaderGroup<TData>;
}

const DataGridColumnHeaderGroup = <TData extends RowData>({
  group,
}: DataGridColumnHeaderGroupProps<TData>) => {
  const { classNames, styles } = useDataGridContext();
  const { headerHeight } = useDataGridDensity();

  return (
    <div
      className={clsx("DataGridColumnHeaderGroup-root", gridHeaderGroupStyles.root, classNames?.columnHeaderGroup?.root)}
      style={{
        ...styles?.columnHeaderGroup?.root,
        height: headerHeight,
      }}
    >
      {/* Headers */}
      {group.headers.map(header => true && header.subHeaders.length === 0 ? (
        // Draggable Header Cell
        <DataGridColumnHeaderCellDnd key={header.id} header={header}>
          {(draggableCtx, droppableCtx) => (
            <DataGridColumnHeaderCell key={header.id} 
              header={header} 
              draggableCtx={draggableCtx} 
              droppableCtx={droppableCtx} 
            />
          )}
        </DataGridColumnHeaderCellDnd>
      ) : (
        // Header Cell
        <DataGridColumnHeaderCell key={header.id} 
          header={header} 
        />
      ))}
    </div>
  )
}

export default DataGridColumnHeaderGroup;

import { RowData, HeaderGroup } from "@tanstack/react-table";
import clsx from "clsx";

import gridHeaderGroupStyles from "./DataGridColumnHeaderGroup.module.css";

import DataGridColumnHeaderCell from "./DataGridColumnHeaderCell";
import DataGridColumnHeaderCellDnd from "./DataGridColumnHeaderCellDnd";
import { DataGridInstance } from "../types";

export interface DataGridColumnHeaderGroupProps<TData extends RowData> {
  instance: DataGridInstance<TData>;
  group: HeaderGroup<TData>;
}

const DataGridColumnHeaderGroup = <TData extends RowData>({
  instance,
  group,
}: DataGridColumnHeaderGroupProps<TData>) => {
  return (
    <div
      className={clsx("DataGridColumnHeaderGroup-root", gridHeaderGroupStyles.root, instance.options.classNames?.columnHeaderGroup?.root)}
      style={{
        ...instance.options.styles?.columnHeaderGroup?.root,
        height: instance.density.headerHeight,
      }}
    >
      {/* Headers */}
      {group.headers.map(header => true && header.subHeaders.length === 0 ? (
        // Draggable Header Cell
        <DataGridColumnHeaderCellDnd key={header.id} header={header}>
          {(draggableCtx, droppableCtx) => (
            <DataGridColumnHeaderCell key={header.id} 
              header={header}
              instance={instance}
              draggableCtx={draggableCtx} 
              droppableCtx={droppableCtx} 
            />
          )}
        </DataGridColumnHeaderCellDnd>
      ) : (
        // Header Cell
        <DataGridColumnHeaderCell
          key={header.id} 
          header={header} 
          instance={instance}
        />
      ))}
    </div>
  )
}

export default DataGridColumnHeaderGroup;

import { RowData } from "@tanstack/react-table";
import clsx from "clsx";

import styles from "./DataGridColumnHeadersGroup.module.css";

import { DataGridInstance, HeaderGroup } from "../types";
import DataGridColumnHeadersCell from "./DataGridColumnHeadersCell";
import DataGridColumnHeadersCellDnd from "./DataGridColumnHeadersCellDnd";

export interface DataGridColumnHeadersGroupProps<TData extends RowData> {
  instance: DataGridInstance<TData>;
  group: HeaderGroup<TData>;
}

const DataGridColumnHeadersGroup = <TData extends RowData>({
  instance,
  group,
}: DataGridColumnHeadersGroupProps<TData>) => {
  return (
    <div
      className={clsx("DataGridColumnHeadersGroup-root", styles.root, instance.options.classNames?.columnHeadersGroup?.root)}
      style={{
        ...instance.options.styles?.columnHeadersGroup?.root,
        minHeight: instance.getDensityModel().headerHeight,
      }}
      role="row"
    >
      {/* Headers */}
      {group.headers.map(header => header.column.columnDef.enableReordering !== false
        // Only for leaf headers
        && header.subHeaders.length === 0 ? (
        // Draggable Header Cell
        <DataGridColumnHeadersCellDnd key={header.id} header={header}>
          {(draggableCtx, droppableCtx) => (
            <DataGridColumnHeadersCell key={header.id} 
              header={header}
              instance={instance}
              draggableCtx={draggableCtx} 
              droppableCtx={droppableCtx} 
            />
          )}
        </DataGridColumnHeadersCellDnd>
      ) : (
        // Header Cell
        <DataGridColumnHeadersCell
          key={header.id} 
          header={header} 
          instance={instance}
        />
      ))}
    </div>
  )
}

export default DataGridColumnHeadersGroup;

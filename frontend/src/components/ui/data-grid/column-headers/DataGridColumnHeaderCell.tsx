import { ActionIcon } from "@mantine/core";
import { Header, RowData, flexRender } from "@tanstack/react-table";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import clsx from "clsx";

import gridHeaderCellStyles from "./DataGridColumnHeaderCell.module.css";

import { useDataGridContext } from "../providers/DataGridContext";
import { useDataGridDensity } from "../providers/DensityContext";
import ColumnDragHandle from "../components/ColumnDragHandle";
import ColumnMenu from "../components/ColumnMenu";
import ColumnSortingToggle from "../components/ColumnSortingToggle";
import ResizeHandler from "./ResizeHandler";

import { IconGripHorizontal } from "@tabler/icons-react";

export interface DataGridColumnHeaderCellProps<TData extends RowData, TValue> {
  header: Header<TData, TValue>;
  draggableCtx?: ReturnType<typeof useDraggable>; 
  droppableCtx?: ReturnType<typeof useDroppable>;
  isOverlay?: boolean;
}

const DataGridColumnHeaderCell = <TData extends RowData, TValue>({
  header,
  draggableCtx,
  droppableCtx,
  isOverlay,
}: DataGridColumnHeaderCellProps<TData, TValue>) => {
  const { classNames, styles } = useDataGridContext();
  const { headerHeight } = useDataGridDensity();
  
  return (
    <div
      className={clsx(
        "DataGridColumnHeaderCell-root", 
        gridHeaderCellStyles.root,
        {
          [gridHeaderCellStyles.overlay]: isOverlay,
          [gridHeaderCellStyles.draggableOver]: droppableCtx?.isOver,
        },
        classNames?.columnHeaderCell?.root
      )}
      style={{
        ...styles?.columnHeaderCell?.root,
        width: header.getSize(),
        height: headerHeight,
      }}

      ref={droppableCtx?.setNodeRef}
    >
      {/* Content */}
      {!header.isPlaceholder ? (
        <div
          className={clsx("DataGridColumnHeaderCell-content", gridHeaderCellStyles.content, classNames?.columnHeaderCell?.content)}
          style={styles?.columnHeaderCell?.content}
        >
          <div
            className={clsx("DataGridColumnHeaderCell-contentLabel", gridHeaderCellStyles.contentLabel, classNames?.columnHeaderCell?.contentLabel)}
            style={styles?.columnHeaderCell?.content}
          >
            <div
              className={clsx("DataGridColumnHeaderCell-label", gridHeaderCellStyles.label, classNames?.columnHeaderCell?.label)}
              style={styles?.columnHeaderCell?.label}
            >
              {flexRender(header.column.columnDef.header, header.getContext())}
            </div>

            {header.subHeaders.length === 0 ? (
              <div
                className={clsx("DataGridColumnHeaderCell-actions", gridHeaderCellStyles.actions, classNames?.columnHeaderCell?.actions)}
                style={styles?.columnHeaderCell?.actions}
              >
                {header.column.getCanSort() ? <ColumnSortingToggle header={header} /> : null}
                {draggableCtx ? <ColumnDragHandle draggableCtx={draggableCtx} /> : null}
                <ColumnMenu header={header} />
              </div>) 
            : null}
          </div>

          {header.column.getCanFilter() && header.subHeaders.length === 0 ? (
            <div
              className={clsx("DataGridColumnHeaderCell-filter", gridHeaderCellStyles.filter, classNames?.columnHeaderCell?.filter)}
              style={styles?.columnHeaderCell?.filters}
            >
              Filters
            </div>
          ) : null}
        </div>
      ) : null}
      
      {!isOverlay && header.column.getCanResize() ? <ResizeHandler header={header} /> : null}
    </div>
  );
}

export default DataGridColumnHeaderCell;

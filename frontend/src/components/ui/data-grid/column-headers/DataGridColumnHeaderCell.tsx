import { ActionIcon } from "@mantine/core";
import { Header, RowData, flexRender } from "@tanstack/react-table";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import clsx from "clsx";

import gridHeaderCellStyles from "./DataGridColumnHeaderCell.module.css";

import { DataGridInstance } from "../types";
import ColumnDragHandle from "../components/ColumnDragHandle";
import ColumnMenu from "../components/ColumnMenu";
import ColumnSortingToggle from "../components/ColumnSortingToggle";
import ResizeHandler from "./ResizeHandler";


export interface DataGridColumnHeaderCellProps<TData extends RowData, TValue> {
  instance: DataGridInstance<TData>;
  header: Header<TData, TValue>;
  draggableCtx?: ReturnType<typeof useDraggable>; 
  droppableCtx?: ReturnType<typeof useDroppable>;
  isOverlay?: boolean;
}

const DataGridColumnHeaderCell = <TData extends RowData, TValue>({
  instance,
  header,
  draggableCtx,
  droppableCtx,
  isOverlay,
}: DataGridColumnHeaderCellProps<TData, TValue>) => {
  return (
    <div
      className={clsx(
        "DataGridColumnHeaderCell-root", 
        gridHeaderCellStyles.root,
        {
          [gridHeaderCellStyles.overlay]: isOverlay,
          [gridHeaderCellStyles.draggableOver]: droppableCtx?.isOver,
        },
        instance.options.classNames?.columnHeaderCell?.root
      )}
      style={{
        ...instance.options.styles?.columnHeaderCell?.root,
        width: header.getSize(),
        height: instance.density.headerHeight,
      }}

      ref={droppableCtx?.setNodeRef}
    >
      {/* Content */}
      {!header.isPlaceholder ? (
        <div
          className={clsx("DataGridColumnHeaderCell-content", gridHeaderCellStyles.content, instance.options.classNames?.columnHeaderCell?.content)}
          style={instance.options.styles?.columnHeaderCell?.content}
        >
          <div
            className={clsx("DataGridColumnHeaderCell-contentLabel", gridHeaderCellStyles.contentLabel, instance.options.classNames?.columnHeaderCell?.contentLabel)}
            style={instance.options.styles?.columnHeaderCell?.content}
          >
            <div
              className={clsx("DataGridColumnHeaderCell-label", gridHeaderCellStyles.label, instance.options.classNames?.columnHeaderCell?.label)}
              style={instance.options.styles?.columnHeaderCell?.label}
            >
              {flexRender(header.column.columnDef.header, header.getContext())}
            </div>

            {header.subHeaders.length === 0 ? (
              <div
                className={clsx("DataGridColumnHeaderCell-actions", gridHeaderCellStyles.actions, instance.options.classNames?.columnHeaderCell?.actions)}
                style={instance.options.styles?.columnHeaderCell?.actions}
              >
                {header.column.getCanSort() ? <ColumnSortingToggle header={header} /> : null}
                {draggableCtx ? <ColumnDragHandle draggableCtx={draggableCtx} /> : null}
                <ColumnMenu header={header} />
              </div>) 
            : null}
          </div>

          {header.column.getCanFilter() && header.subHeaders.length === 0 ? (
            <div
              className={clsx("DataGridColumnHeaderCell-filter", gridHeaderCellStyles.filter, instance.options.classNames?.columnHeaderCell?.filter)}
              style={instance.options.styles?.columnHeaderCell?.filters}
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

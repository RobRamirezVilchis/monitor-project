import { RowData, flexRender } from "@tanstack/react-table";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import clsx from "clsx";

import gridHeaderCellStyles from "./DataGridColumnHeaderCell.module.css";

import { DataGridInstance, Header } from "../types";
import ColumnDragHandle from "../components/ColumnDragHandle";
import ColumnFilter from "../components/filters/ColumnFilter";
import ColumnMenu from "../components/ColumnMenu";
import ColumnSortingToggle from "../components/ColumnSortingToggle";
import ResizeHandler from "../components/ResizeHandler";


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
  const columnDef = header.column.columnDef;

  return (
    <div
      className={clsx(
        "DataGridColumnHeaderCell-root", 
        gridHeaderCellStyles.root,
        {
          [`${gridHeaderCellStyles.overlay} ${instance.options.classNames?.columnHeaderCell?.dragOverlay?.root}`]: isOverlay,
          [`${gridHeaderCellStyles.draggableOver} ${instance.options.classNames?.columnHeaderCell?.dragIsOver?.root}`]: droppableCtx?.isOver,
          [`${gridHeaderCellStyles.verticalPadding}`]: instance.getState().columnFiltersOpen,
        },
        instance.options.classNames?.columnHeaderCell?.root,
        columnDef.headerClassNames?.root,
      )}
      style={{
        ...instance.options.styles?.columnHeaderCell?.root,
        ...columnDef.headerStyles?.root,
        width: header.getSize(),
        minHeight: instance.getDensityModel().headerHeight,
      }}

      ref={droppableCtx?.setNodeRef}
      role="columnheader"
    >
      {/* Content */}
      {!header.isPlaceholder ? (
        <div
          className={clsx("DataGridColumnHeaderCell-content", gridHeaderCellStyles.content, instance.options.classNames?.columnHeaderCell?.content, columnDef.headerClassNames?.content, {
            [`${instance.options.classNames?.columnHeaderCell?.dragOverlay?.content} ${columnDef.headerClassNames?.dragOverlay?.content}`]: isOverlay,
            [`${instance.options.classNames?.columnHeaderCell?.dragIsOver?.content} ${columnDef.headerClassNames?.dragIsOver?.content}`]: droppableCtx?.isOver,
          })}
          style={{
            ...instance.options.styles?.columnHeaderCell?.content,
            ...columnDef.headerStyles?.content,
          }}
        >
          <div
            className={clsx("DataGridColumnHeaderCell-contentLabel", gridHeaderCellStyles.contentLabel, instance.options.classNames?.columnHeaderCell?.contentLabel, columnDef.headerClassNames?.contentLabel, {
              [`${instance.options.classNames?.columnHeaderCell?.dragOverlay?.contentLabel} ${columnDef.headerClassNames?.dragOverlay?.contentLabel}`]: isOverlay,
              [`${instance.options.classNames?.columnHeaderCell?.dragIsOver?.contentLabel} ${columnDef.headerClassNames?.dragIsOver?.contentLabel}`]: droppableCtx?.isOver,
            })}
            style={{
              ...instance.options.styles?.columnHeaderCell?.contentLabel,
              ...columnDef.headerStyles?.contentLabel,
            }}
          >
            <div
              className={clsx("DataGridColumnHeaderCell-label", gridHeaderCellStyles.label, instance.options.classNames?.columnHeaderCell?.label, columnDef.headerClassNames?.label, {
                [`${instance.options.classNames?.columnHeaderCell?.dragOverlay?.label} ${columnDef.headerClassNames?.dragOverlay?.label}`]: isOverlay,
                [`${instance.options.classNames?.columnHeaderCell?.dragIsOver?.label} ${columnDef.headerClassNames?.dragIsOver?.label}`]: droppableCtx?.isOver,
              })}
              style={{
                ...instance.options.styles?.columnHeaderCell?.label,
                ...columnDef.headerStyles?.label,
              }}
              title={header.column.columnDef.columnTitle}
            >
              {flexRender(header.column.columnDef.header, header.getContext())}
            </div>

            {header.subHeaders.length === 0 && !isOverlay ? (
              <div
                className={clsx("DataGridColumnHeaderCell-actions", gridHeaderCellStyles.actions, instance.options.classNames?.columnHeaderCell?.actions, columnDef.headerClassNames?.actions)}
                style={{
                  ...instance.options.styles?.columnHeaderCell?.actions,
                  ...columnDef.headerStyles?.actions,
                }}
              >
                {instance.options.enableSorting && header.column.getCanSort() 
                ? <ColumnSortingToggle header={header} instance={instance} /> 
                : null}
                {instance.options.enableColumnReordering && header.column.columnDef.enableReordering && draggableCtx 
                ? <ColumnDragHandle draggableCtx={draggableCtx} instance={instance} /> 
                : null}
                {instance.options.enableColumnActions && header.column.columnDef.enableColumnActions
                ? <ColumnMenu instance={instance} header={header} /> 
                : null}
              </div>) 
            : null}
          </div>

          {header.column.getCanFilter() && header.subHeaders.length === 0 ? (
            <div
              className={clsx("DataGridColumnHeaderCell-filter", {
                [`${gridHeaderCellStyles["filter--closed"]}`]: !instance.getState().columnFiltersOpen,
              }, gridHeaderCellStyles.filter, instance.options.classNames?.columnHeaderCell?.filter, columnDef.headerClassNames?.filter)}
              style={{
                ...instance.options.styles?.columnHeaderCell?.filters,
                ...columnDef.headerStyles?.filters,  
              }}
            >
              <ColumnFilter header={header} instance={instance} />
            </div>
          ) : null}
        </div>
      ) : null}
      
      {!isOverlay && header.column.getCanResize() ? <ResizeHandler header={header} instance={instance} /> : null}
    </div>
  );
}

export default DataGridColumnHeaderCell;

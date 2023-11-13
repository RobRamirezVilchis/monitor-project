import { RowData, flexRender } from "@tanstack/react-table";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import clsx from "clsx";

import styles from "./DataGridColumnHeadersCell.module.css";

import { DataGridInstance, Header } from "../types";
import ColumnDragHandle from "../components/ColumnDragHandle";
import ColumnFilter from "../components/filters/ColumnFilter";
import ColumnMenu from "../components/ColumnMenu";
import ColumnSortingToggle from "../components/ColumnSortingToggle";
import ResizeHandler from "../components/ResizeHandler";

export interface DataGridColumnHeadersCellProps<TData extends RowData, TValue> {
  instance: DataGridInstance<TData>;
  header: Header<TData, TValue>;
  draggableCtx?: ReturnType<typeof useDraggable>; 
  droppableCtx?: ReturnType<typeof useDroppable>;
  isOverlay?: boolean;
}

const DataGridColumnHeadersCell = <TData extends RowData, TValue>({
  instance,
  header,
  draggableCtx,
  droppableCtx,
  isOverlay,
}: DataGridColumnHeadersCellProps<TData, TValue>) => {
  const columnDef = header.column.columnDef;
  const colDefClassNames = typeof columnDef.headerClassNames === "function"
    ? columnDef.headerClassNames(header)
    : columnDef.headerClassNames;

  return (
    <div
      className={clsx(
        "DataGridColumnHeadersCell-root", 
        styles.root,
        {
          [`${styles.overlay} ${instance.options.classNames?.columnHeadersCell?.dragOverlay?.root}`]: isOverlay,
          [`${styles.draggableOver} ${instance.options.classNames?.columnHeadersCell?.dragIsOver?.root}`]: droppableCtx?.isOver,
          [`${styles.verticalPadding}`]: instance.getState().columnFiltersOpen,
        },
        instance.options.classNames?.columnHeadersCell?.root,
        colDefClassNames?.root,
      )}
      style={{
        ...instance.options.styles?.columnHeadersCell?.root,
        ...columnDef.headerStyles?.root,
        width: header.getSize(),
        minHeight: instance.getDensityModel().headerHeight,
      }}

      ref={droppableCtx?.setNodeRef}
      role="columnheaders"
    >
      {/* Content */}
      {!header.isPlaceholder ? (
        <div
          className={clsx("DataGridColumnHeadersCell-content", styles.content, instance.options.classNames?.columnHeadersCell?.content, colDefClassNames?.content, {
            [`${instance.options.classNames?.columnHeadersCell?.dragOverlay?.content} ${colDefClassNames?.dragOverlay?.content}`]: isOverlay,
            [`${instance.options.classNames?.columnHeadersCell?.dragIsOver?.content} ${colDefClassNames?.dragIsOver?.content}`]: droppableCtx?.isOver,
          })}
          style={{
            ...instance.options.styles?.columnHeadersCell?.content,
            ...columnDef.headerStyles?.content,
          }}
        >
          <div
            className={clsx("DataGridColumnHeadersCell-contentLabel", styles.contentLabel, instance.options.classNames?.columnHeadersCell?.contentLabel, colDefClassNames?.contentLabel, {
              [`${instance.options.classNames?.columnHeadersCell?.dragOverlay?.contentLabel} ${colDefClassNames?.dragOverlay?.contentLabel}`]: isOverlay,
              [`${instance.options.classNames?.columnHeadersCell?.dragIsOver?.contentLabel} ${colDefClassNames?.dragIsOver?.contentLabel}`]: droppableCtx?.isOver,
            })}
            style={{
              ...instance.options.styles?.columnHeadersCell?.contentLabel,
              ...columnDef.headerStyles?.contentLabel,
            }}
          >
            <div
              className={clsx("DataGridColumnHeadersCell-label", styles.label, instance.options.classNames?.columnHeadersCell?.label, colDefClassNames?.label, {
                [`${instance.options.classNames?.columnHeadersCell?.dragOverlay?.label} ${colDefClassNames?.dragOverlay?.label}`]: isOverlay,
                [`${instance.options.classNames?.columnHeadersCell?.dragIsOver?.label} ${colDefClassNames?.dragIsOver?.label}`]: droppableCtx?.isOver,
              })}
              style={{
                ...instance.options.styles?.columnHeadersCell?.label,
                ...columnDef.headerStyles?.label,
              }}
              title={header.column.columnDef.columnTitle}
            >
              {flexRender(header.column.columnDef.header, header.getContext())}
            </div>

            {header.subHeaders.length === 0 && !isOverlay ? (
              <div
                className={clsx("DataGridColumnHeadersCell-actions", styles.actions, instance.options.classNames?.columnHeadersCell?.actions, colDefClassNames?.actions)}
                style={{
                  ...instance.options.styles?.columnHeadersCell?.actions,
                  ...columnDef.headerStyles?.actions,
                }}
              >
                {instance.options.enableSorting && header.column.getCanSort() 
                ? <ColumnSortingToggle header={header} instance={instance} /> 
                : null}
                {instance.options.enableColumnReordering && header.column.columnDef.enableReordering !== false && draggableCtx 
                ? <ColumnDragHandle draggableCtx={draggableCtx} instance={instance} /> 
                : null}
                {instance.options.enableColumnActions && header.column.columnDef.enableColumnActions !== false
                ? <ColumnMenu instance={instance} header={header} /> 
                : null}
              </div>) 
            : null}
          </div>

          {header.column.getCanFilter() && header.subHeaders.length === 0 ? (
            <div
              className={clsx("DataGridColumnHeadersCell-filter", {
                [`${styles["filter--closed"]}`]: !instance.getState().columnFiltersOpen,
              }, styles.filter, instance.options.classNames?.columnHeadersCell?.filter, colDefClassNames?.filter)}
              style={{
                ...instance.options.styles?.columnHeadersCell?.filters,
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

export default DataGridColumnHeadersCell;

import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { flexRender } from "@tanstack/react-table";
import { useCallback, useRef } from "react";
import clsx from "clsx";

import gridColumnHeadersStyles from "./DataGridColumnHeaders.module.css";

import { useDataGridContext } from "../providers/DataGridContext";
import { useDataGridRefsContext } from "../providers/DataGridRefsProvider";
import { useDataGridScrollContext } from "../providers/DataGridScrollProvider";
import { useIsomorphicLayoutEffect } from "@/hooks/shared/useIsomorphicLayoutEffect";
import ColumnFilter from "../components/ColumnFilter";
import ColumnSort from "../components/ColumnSort";
import DndColumnHeader from "./DndColumnHeader";
import ResizeHandler from "./ResizeHandler";
import type { DataGridInstance } from "../types";

export interface DataGridColumnHeadersProps<TData extends unknown> {
  instance: DataGridInstance<TData>;
}

const DataGridColumnHeaders = <TData extends unknown>({
  instance,
}: DataGridColumnHeadersProps<TData>) => {
  const { classNames, styles } = useDataGridContext();
  const { mainScrollbars } = useDataGridScrollContext();
  const { columnHeaderRefs } = useDataGridRefsContext();

  const headerGroups = instance.getHeaderGroups();

  const columnOrder = useRef(instance.getAllFlatColumns().map(c => c.id));

  useIsomorphicLayoutEffect(() => {
    mainScrollbars.horizontal.syncScroll(columnHeaderRefs.main);

    return () => {
      mainScrollbars.horizontal.desyncScroll(columnHeaderRefs.main);
    };
  }, [mainScrollbars.horizontal, columnHeaderRefs.main]);

  const onHeaderDragEnd = useCallback((e: DragEndEvent) => {
    const { active, over } = e;
    if (!active || !over || active.id === over.id) {
      return;
    }

    const activeIndex = columnOrder.current.findIndex(id => id === active.id);
    const overIndex = columnOrder.current.findIndex(id => id === over?.id);
    if (activeIndex === -1 || overIndex === -1) {
      return;
    }

    const newColumnOrder = [...columnOrder.current];
    newColumnOrder[activeIndex] = over.id as string;
    newColumnOrder[overIndex] = active.id as string;

    columnOrder.current = newColumnOrder;
    instance.setColumnOrder(newColumnOrder);
  }, [instance]);

  // Viewport
  return (
    <div
      className={clsx("DataGridColumnHeaders-root DataGridColumnHeaders-viewport", gridColumnHeadersStyles.root, classNames?.columnHeaders?.root)}
      style={styles?.columnHeaders?.root}
      // TODO: Ignore events if resizing or reordering
      onWheel={mainScrollbars.horizontal.onWheel}
      onTouchStart={mainScrollbars.horizontal.onTouchStart}
      onTouchMove={mainScrollbars.horizontal.onTouchMove}
      onTouchEnd={mainScrollbars.horizontal.onTouchEnd}
    >
      {/* Columns */}
      <DndContext
        onDragEnd={onHeaderDragEnd}
      >
      <div
        ref={columnHeaderRefs.main}
        className={clsx("DataGridColumnHeaders-headersContainer", gridColumnHeadersStyles.headersContainer, classNames?.columnHeaders?.headersContainer)}
        style={{
          ...styles?.columnHeaders?.headersContainer,
          width: instance.getTotalSize(),
        }}
      >
        {/* Groups */}
        {headerGroups.map(group => (
          <div key={group.id}
            style={{
              display: "flex",
              
              borderBottom: "1px solid black",
            }}
          >
            {/* Headers */}
            {group.headers.map(header => (
              // Header Cell
              <DndColumnHeader // was <div />
                dndId={header.id}
                key={header.id} 
                style={{ 
                  position: "relative",
                  width: header.getSize(),
                  display: "flex",
                  alignItems: "center",
                  gap: 4,

                  borderRight: "1px solid black",
                }}
                disabled={
                  header.isPlaceholder 
                  || header.subHeaders.length > 0
                  || header.column.getIsResizing()
                }
              >
                {
                  !header.isPlaceholder
                  ? flexRender(header.column.columnDef.header, header.getContext())
                  : null
                }
                {/* Sort Action */}
                {header.column.getCanSort() && header.subHeaders.length === 0 
                  ? <ColumnSort header={header} /> 
                  : null}
                {/* Resize Handler */}
                {header.column.getCanResize() ? <ResizeHandler header={header} /> : null}

                {!header.isPlaceholder && header.column.getCanFilter() ? <ColumnFilter header={header} instance={instance} /> : null}
              </DndColumnHeader>
            ))}
          </div>
        ))}
      </div>
      </DndContext>
    </div>
  )
}

export default DataGridColumnHeaders;

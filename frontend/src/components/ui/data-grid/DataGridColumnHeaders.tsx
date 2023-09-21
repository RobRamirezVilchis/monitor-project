import { CSSProperties, useCallback, useRef } from "react";
import { 
  flexRender, 
} from "@tanstack/react-table";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import clsx from "clsx";

import gridColumnHeadersStyles from "./DataGridColumnHeaders.module.css";

import { useDataGridContext } from "./DataGridContext";
import { useIsomorphicLayoutEffect } from "@/hooks/shared/useIsomorphicLayoutEffect";
import type { DataGridInstance } from "./types";
import ResizeHandler from "./components/ResizeHandler";
import ColumnSort from "./components/ColumnSort";
import DndColumnHeader from "./components/DndColumnHeader";
import ColumnFilter from "./components/ColumnFilter";

export interface DataGridColumnHeadersClassNames {
  root?: string;
  headersContainer?: string;
  headerRow?: string;
  headerCell?: string;
}

export interface DataGridColumnHeadersStyles {
  root?: CSSProperties;
  headersContainer?: CSSProperties;
  headerRow?: CSSProperties;
  headerCell?: CSSProperties;
}

export interface DataGridColumnHeadersProps<TData extends unknown> {
  instance: DataGridInstance<TData>;
  classNames?: DataGridColumnHeadersClassNames;
  styles?: DataGridColumnHeadersStyles;
}

const DataGridColumnHeaders = <TData extends unknown>({
  instance,
  classNames,
  styles,
}: DataGridColumnHeadersProps<TData>) => {
  const { mainXScroll } = useDataGridContext();

  const headerGroups = instance.getHeaderGroups();

  const columnOrder = useRef(instance.getAllFlatColumns().map(c => c.id));

  useIsomorphicLayoutEffect(() => {
    mainXScroll.syncScroll(instance.refs.columnHeader.main);

    return () => {
      mainXScroll.desyncScroll(instance.refs.columnHeader.main);
    };
  }, []);

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
      className={clsx("DataGridColumnHeaders-root DataGridColumnHeaders-viewport", gridColumnHeadersStyles.root, classNames?.root)}
      style={styles?.root}
      // TODO: Ignore events if resizing or reordering
      onWheel={mainXScroll.onWheel}
      onTouchStart={mainXScroll.onTouchStart}
      onTouchMove={mainXScroll.onTouchMove}
      onTouchEnd={mainXScroll.onTouchEnd}
    >
      {/* Columns */}
      <DndContext
        onDragEnd={onHeaderDragEnd}
      >
      <div
        ref={instance.refs.columnHeader.main}
        className={clsx("DataGridColumnHeaders-headersContainer", gridColumnHeadersStyles.headersContainer, classNames?.headersContainer)}
        style={{
          ...styles?.headersContainer,
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

import { useCallback, useRef } from "react";
import { 
  flexRender, 
  Table,
} from "@tanstack/react-table";
import { DndContext, DragEndEvent, UniqueIdentifier } from "@dnd-kit/core";
import { useVirtualizer } from "@tanstack/react-virtual";

import { useScrollsContext } from "./ScrollsProvider";
import { useIsomorphicLayoutEffect } from "@/hooks/shared/useIsomorphicLayoutEffect";
import ResizeHandler from "./components/ResizeHandler";
import ColumnSort from "./components/ColumnSort";
import DndColumnHeader from "./components/DndColumnHeader";
import ColumnFilter from "./components/ColumnFilter";

export interface DataGridColumnHeadersVirtualizedProps<TData extends unknown> {
  table: Table<TData>;
}

// TODO: Fix or discard implementation

const DataGridColumnHeadersVirtualized = <TData extends unknown>({
  table,
}: DataGridColumnHeadersVirtualizedProps<TData>) => {
  const headersRef = useRef<HTMLDivElement>(null);
  const { xScroll } = useScrollsContext();

  const headerGroups = table.getHeaderGroups();

  const columnOrder = useRef(table.getAllFlatColumns().map(c => c.id));

  // TODO: Reuse virtualizer from DataGridBodyVirtualized instead of duplicating
  const leafColumns = table.getAllLeafColumns();
  
  const xVirtualizer = useVirtualizer({
    count: leafColumns.length,
    overscan: 1,
    getScrollElement: () => xScroll.scrollRef.current,
    estimateSize: i => leafColumns[i].getSize(),
    horizontal: true,
  });

  useIsomorphicLayoutEffect(() => {
    xScroll.syncScroll(headersRef);

    return () => {
      xScroll.desyncScroll(headersRef);
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
    table.setColumnOrder(newColumnOrder);
  }, [table]);

  // Viewport
  return (
    <div
      style={{
        width: "100%",
        overflow: "hidden",
        overflowAnchor: "none", // for virtualization
        touchAction: "pan-down", // for mobile browser refresh gesture
      }}
      // TODO: Ignore events if resizing or reordering
      onWheel={xScroll.onWheel}
      onTouchStart={xScroll.onTouchStart}
      onTouchMove={xScroll.onTouchMove}
      onTouchEnd={xScroll.onTouchEnd}
    >
      {/* Columns */}
      <DndContext
        onDragEnd={onHeaderDragEnd}
      >
      <div
        ref={headersRef}
        style={{
          width: table.getTotalSize(),
          overflow: "hidden",
        }}
      >
        {/* Groups */}
        {headerGroups.map(group => (
          <div key={group.id}
            style={{
              display: "flex",
              
              borderBottom: "1px solid black",

              position: "relative",
              width: xVirtualizer.getTotalSize(),
              height: 64,
            }}
          >
            {/* Headers */}
            {xVirtualizer.getVirtualItems().map((virtualCol) => {
              const header = group.headers[virtualCol.index];
              
              return (
                // Header Cell
                <DndColumnHeader // was <div />
                  dndId={header.id}
                  key={header.id} 
                  style={{ 
                    // width: header.getSize(),
                    display: "flex",
                    alignItems: "center",
                    gap: 4,

                    borderRight: "1px solid black",

                    width:  `${virtualCol.size}px`,
                    transform: `translateX(${virtualCol.start}px)`,
                    position: "absolute",
                    height: "100%",
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

                  {!header.isPlaceholder && header.column.getCanFilter() ? <ColumnFilter header={header} instance={table} /> : null}
                </DndColumnHeader>
              )
            })}
          </div>
        ))}
      </div>
      </DndContext>
    </div>
  )
}

export default DataGridColumnHeadersVirtualized;

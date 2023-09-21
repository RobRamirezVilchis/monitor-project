import { Fragment, useRef, useState } from "react";
import { 
  flexRender, 
  Row, 
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";

import { useIsomorphicLayoutEffect } from "@/hooks/shared/useIsomorphicLayoutEffect";
import { useScrollsContext } from "./ScrollsProvider";
import type { DataGridInstance } from "../types";
import LoadingOverlay from "@/components/ui/data-grid/components/LoadingOverlay";
import Scroll from "@/components/ui/data-grid/components/Scroll";

export interface DataGridBodyVirtualizedProps<TData extends unknown> {
  instance: DataGridInstance<TData>;
  renderSubComponent?: (row: Row<TData>) => React.ReactNode;
}

const DataGridBodyVirtualized = <TData extends unknown>({
  instance, renderSubComponent,
}: DataGridBodyVirtualizedProps<TData>) => {
  const { xScroll, yScroll } = useScrollsContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentRect, setContentRect] = useState({ 
    width: 0, 
    height: 0,
  });
  const rowModel = instance.getRowModel();
  const leafColumns = instance.getAllLeafColumns();
  
  const xVirtualizer = useVirtualizer({
    count: leafColumns.length,
    overscan: 1,
    getScrollElement: () => xScroll.scrollRef.current,
    estimateSize: i => leafColumns[i].getSize(),
    horizontal: true,
  });

  const yVirtualizer = useVirtualizer({
    count: rowModel.rows.length,
    overscan: 1,
    getScrollElement: () => yScroll.scrollRef.current,
    estimateSize: () => 36,
  });
  
  useIsomorphicLayoutEffect(() => {
    xScroll.syncScroll(contentRef);
    yScroll.syncScroll(contentRef);

    if (!contentRef.current) return;

    const resizeObserver = new ResizeObserver((entries, observer) => {
      const content = entries[0].target as HTMLDivElement;
      setContentRect({ 
        width: content.offsetWidth ?? 0, 
        height: content.offsetHeight ?? 0
      });
    });
    resizeObserver.observe(contentRef.current);

    return () => {
      resizeObserver.disconnect();
      xScroll.desyncScroll(contentRef);
      yScroll.desyncScroll(contentRef);
    };
  }, []);

  // Wrapper
  return (
    <div
      style={{
        width: "100%",
        flex: 1,
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gridTemplateRows: "1fr auto",
        overflow: "hidden",
        overflowAnchor: "none", // for virtualization
        position: "relative",
      }}
    >
      {/* Viewport */}
      <div
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          overflowAnchor: "none", // for virtualization
          touchAction: "pan-down", // for mobile browser refresh gesture
        }}
        onWheel={e => {
          xScroll.onWheel(e);
          yScroll.onWheel(e);
        }}
        onTouchStart={e => {
          xScroll.onTouchStart(e);
          yScroll.onTouchStart(e);
        }}
        onTouchMove={e => {
          xScroll.onTouchMove(e);
          yScroll.onTouchMove(e);
        }}
        onTouchEnd={e => {
          xScroll.onTouchEnd(e);
          yScroll.onTouchEnd(e);
        }}
      >
        {/* Content */}
        <div
          style={{
            overflow: "hidden",
            overflowAnchor: "none", // for virtualization
            touchAction: "pan-down", // for mobile browser refresh gesture
            display: "flex",
            flexDirection: "column",
            // width: instance.getTotalSize(),

            position: "relative",
            height: yVirtualizer.getTotalSize(),
            width: xVirtualizer.getTotalSize(),
          }}
          ref={contentRef}
        >
          {/* Rows */}
          {yVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rowModel.rows[virtualRow.index];

            return (
              <Fragment key={row.id}>
                <div
                  style={{
                    display: "flex",
                    // width: instance.getTotalSize(),
                    
                    position: "absolute",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                    width: xVirtualizer.getTotalSize(),
                  }}
                >
                  {/* Cells */}
                  {xVirtualizer.getVirtualItems().map((virtualCol) => {
                    const cell = row.getVisibleCells()[virtualCol.index];

                    return (
                      <div key={cell.id}
                        style={{
                          // width: cell.column.getSize(),
                        
                          width: `${virtualCol.size}px`,
                          position: "absolute",
                          transform: `translateX(${virtualCol.start}px)`,
                          height: "100%",
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    );
                  })}
                </div>

                {/* Expandable SubComponent */}
                {/* TODO: Fix or remove support for SubComponents with virtualization */}
                {renderSubComponent && row.getIsExpanded() ? (
                  <div
                    style={{
                      display: "flex",
                      transform: `translateY(${virtualRow.start + virtualRow.size}px)`,
                    }}
                  >
                    {renderSubComponent(row)}
                  </div>
                ) : null}
              </Fragment>
            );
          })}
        </div>
      </div>
      <Scroll orientation="vertical" virtualSize={contentRect.height} ref={yScroll.scrollRef} onScroll={yScroll.onScroll} />
      <Scroll orientation="horizontal" virtualSize={contentRect.width} ref={xScroll.scrollRef} onScroll={xScroll.onScroll} />

      {false ? <LoadingOverlay /> : null}
    </div>
  );
}

export default DataGridBodyVirtualized;


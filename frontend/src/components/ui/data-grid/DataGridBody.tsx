import { useRef, useState } from "react";
import { 
  flexRender, 
  Table, 
} from "@tanstack/react-table";

import { useIsomorphicLayoutEffect } from "@/hooks/shared/useIsomorphicLayoutEffect";
import { useScrollsContext } from "./ScrollsProvider";
import LoadingOverlay from "@/components/ui/data-grid/components/LoadingOverlay";
import Scroll from "@/components/ui/data-grid/components/Scroll";

export interface DataGridBodyProps<TData extends unknown> {
  table: Table<TData>;
}

const DataGridBody = <TData extends unknown>({
  table,
}: DataGridBodyProps<TData>) => {
  const { xScroll, yScroll } = useScrollsContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const contentResizeObserverRef = useRef<ResizeObserver>();
  const [contentRect, setContentRect] = useState({ 
    width: 0, 
    height: 0,
  });
  
  useIsomorphicLayoutEffect(() => {
    xScroll.syncScroll(contentRef);
    yScroll.syncScroll(contentRef);

    if (!contentRef.current) return;

    contentResizeObserverRef.current = new ResizeObserver((entries, observer) => {
      const content = entries[0].target as HTMLDivElement;
      setContentRect({ 
        width: content.offsetWidth ?? 0, 
        height: content.offsetHeight ?? 0
      });
    });
    contentResizeObserverRef.current.observe(contentRef.current);

    return () => {
      contentResizeObserverRef.current?.disconnect();
      xScroll.desyncScroll(contentRef);
      yScroll.desyncScroll(contentRef);
    };
  }, []);

  const rowModel = table.getRowModel();

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
            width: table.getTotalSize(),
          }}
          ref={contentRef}
        >
          {/* Rows */}
          {rowModel.rows.map(row => (
            <div key={row.id}
              style={{
                display: "flex",
              }}
            >
              {/* Cells */}
              {row.getVisibleCells().map(cell => (
                <div key={cell.id}
                  style={{
                    width: cell.column.getSize(),
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <Scroll orientation="vertical" virtualSize={contentRect.height} ref={yScroll.scrollRef} onScroll={yScroll.onScroll} />
      <Scroll orientation="horizontal" virtualSize={contentRect.width} ref={xScroll.scrollRef} onScroll={xScroll.onScroll} />

      {false ? <LoadingOverlay /> : null}
    </div>
  );
}

export default DataGridBody;


import { useRef } from "react";
import { 
  flexRender, 
  Table,
} from "@tanstack/react-table";

import { useScrollsContext } from "./ScrollsProvider";
import { useIsomorphicLayoutEffect } from "@/hooks/shared/useIsomorphicLayoutEffect";
import ResizeHandler from "./components/ResizeHandler";

export interface DataGridColumnHeadersProps<TData extends unknown> {
  table: Table<TData>;
}

const DataGridColumnHeaders = <TData extends unknown>({
  table,
}: DataGridColumnHeadersProps<TData>) => {
  const headersRef = useRef<HTMLDivElement>(null);
  const { xScroll } = useScrollsContext();

  const headerGroups = table.getHeaderGroups();

  useIsomorphicLayoutEffect(() => {
    xScroll.syncScroll(headersRef);

    return () => {
      xScroll.desyncScroll(headersRef);
    };
  }, []);

  // Viewport
  return (
    <div
      style={{
        width: "100%",
        overflow: "hidden",
        overflowAnchor: "none", // for virtualization
        touchAction: "pan-down", // for mobile browser refresh gesture
      }}
      onWheel={xScroll.onWheel}
      onTouchStart={xScroll.onTouchStart}
      onTouchMove={xScroll.onTouchMove}
      onTouchEnd={xScroll.onTouchEnd}
    >
      {/* Columns */}
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
            }}
          >
            {/* Headers */}
            {group.headers.map(header => (
              // Header Cell
              <div key={header.id} 
                style={{ 
                  position: "relative",
                  width: header.getSize(),

                  borderRight: "1px solid black",
                }}
              >
                {
                  !header.isPlaceholder
                  ? flexRender(header.column.columnDef.header, header.getContext())
                  : null
                }
                {/* Resize Handler */}
                {header.column.getCanResize() ? <ResizeHandler header={header} /> : null}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default DataGridColumnHeaders;

import { useRef } from "react";
import { 
  useReactTable, 
  flexRender, 
  ColumnDef, 
  Row, 
  getCoreRowModel, 
  createColumnHelper,
  Table,
} from "@tanstack/react-table";

import { useScrollsContext } from "./ScrollsProvider";
import { useIsomorphicLayoutEffect } from "@/hooks/shared/useIsomorphicLayoutEffect";

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
    <div className="grid flex-col"
      style={{
        width: "100%",
        overflow: "hidden",
        overflowAnchor: "none", // for virtualization
        touchAction: "pan-down", // for mobile browser refresh gesture

        backgroundColor: "cyan",
      }}
      onWheel={xScroll.onWheel}
      onTouchStart={xScroll.onTouchStart}
      onTouchMove={xScroll.onTouchMove}
      onTouchEnd={xScroll.onTouchEnd}
    >
      {/* Columns */}
      <div
        ref={headersRef}
        className="bg-red-100"
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
              // width: "100%",
              border: "1px solid black",
            }}
          >
            {/* Headers */}
            {group.headers.map(header => (
              <div key={header.id} 
                style={{ 
                  width: header.getSize(),
                  border: !header.isPlaceholder ? "1px solid black" : undefined,
                }}
              >
                {
                  !header.isPlaceholder 
                  ? flexRender(header.column.columnDef.header, header.getContext())
                  : null
                }
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default DataGridColumnHeaders;

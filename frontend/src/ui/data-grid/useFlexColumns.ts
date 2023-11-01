import { ColumnSizingState, RowData } from "@tanstack/react-table";
import { useRef } from "react";

import { clamp } from "@/utils/math";
import { DataGridInstance } from "./types";
import { useIsomorphicLayoutEffect } from "@/hooks/shared/useIsomorphicLayoutEffect";

type FlexItem = {
  id: string; 
  flex: number; 
  size: number;
  minSize: number;
  maxSize: number;
};

export const useFlexColumns = <TData extends RowData>(instance: DataGridInstance<TData>) => {
  const widthCacheRef = useRef({
    bodyViewport: 0,
    columnHeadersContent: 0,
  });
  const flexItems = useRef<FlexItem[] | null>(null);
  const flexTracking = useRef<Record<string, boolean>>({});

  useIsomorphicLayoutEffect(() => {
    if (!instance.refs.body.main.viewport.current || !instance.refs.columnsHeader.main.content.current) return;
    
    const bodyViewportResizeObserver = new ResizeObserver((entries, observer) => {
      if (!instance.refs.body.main.viewport.current || !instance.refs.columnsHeader.main.content.current) return;

      const bodyViewportWidth = instance.refs.body.main.viewport.current.clientWidth;
      const columnHeadersContentWidth = instance.refs.columnsHeader.main.content.current.clientWidth;
      let totalSize = instance.getTotalSize();

      // Calculate flex for each leaf column
      if (bodyViewportWidth !== widthCacheRef.current.bodyViewport) {
        const cols = instance.getAllLeafColumns();
        const sizing = instance.getState().columnSizing;

        if (flexItems.current === null) {
          flexItems.current = cols.filter(col => col.columnDef.flex).map(col => {
            flexTracking.current[col.id] = true;
            const item = {
              id: col.id,
              flex: col.columnDef.flex!,
              size: col.columnDef.size ?? 0,
              minSize: col.columnDef.minSize!,
              maxSize: col.columnDef.maxSize!,
            };
            return item;
          });
        }
        else {
          // Stop tracking columns which size has been changed by the user
          flexItems.current = flexItems.current.filter(col => {
            const modifiedByUser = sizing[col.id] !== undefined && sizing[col.id] !== col.size;
            if (modifiedByUser && flexTracking.current[col.id])
              delete flexTracking.current[col.id];
            return !modifiedByUser;
          });
        }

        const totalFlex = flexItems.current.reduce((acc, col) => acc + col.flex, 0);
        if (totalFlex > 0) {
          // Update totalSize to bodyViewportWidth since we are going to fill the whole viewport with the flex columns
          totalSize = bodyViewportWidth;

          const nonFlexSize = cols.reduce((acc, col) => {
            if (!flexTracking.current[col.id]) {
              return acc + (clamp(sizing[col.id] ?? col.columnDef.size ?? 0, col.columnDef.minSize!, col.columnDef.maxSize!))
            }
            return acc;
          }, 0);
          const newColumnSizing: ColumnSizingState = {...sizing};

          // let remainingSize = bodyViewportWidth - nonFlexSize;
          // flexItems.current.forEach((col) => {
          //   const size = remainingSize / totalFlex * col.flex;
          //   newColumnSizing[col.id] = clamp(size, col.minSize, col.maxSize);
          //   totalFlex -= col.flex;
          //   remainingSize -= newColumnSizing[col.id];
          // });
          const updated: Record<string, boolean> = {};
          const updateRecursive = (totalSize: number, totalFlex: number) => {
            if (flexItems.current === null) return;

            let remainingSize = totalSize;
            let remainingFlex = totalFlex;
            for (let i = 0; i <= flexItems.current.length - 1; ++i) {
              const col = flexItems.current[i];

              if (updated[col.id]) continue;

              const size = remainingSize / remainingFlex * col.flex;
              newColumnSizing[col.id] = clamp(size, col.minSize, col.maxSize);
              
              remainingFlex -= col.flex;
              remainingSize -= newColumnSizing[col.id];

              if (size > col.maxSize) {
                updated[col.id] = true;
                updateRecursive(totalSize - newColumnSizing[col.id], totalFlex - col.flex);
                break;
              }
            }
          }
          updateRecursive(bodyViewportWidth - nonFlexSize, totalFlex);
          
          flexItems.current.forEach((col) => {
            col.size = newColumnSizing[col.id];
          });
          instance.setColumnSizing(newColumnSizing);
        }
      }

      // Set filler cell width
      if (bodyViewportWidth !== widthCacheRef.current.bodyViewport || columnHeadersContentWidth !== widthCacheRef.current.columnHeadersContent) {
        const fillerSize = bodyViewportWidth - totalSize;
        instance.refs.body.main.viewport.current.style.setProperty("--dg-filler-cell-width", `${Math.max(0, fillerSize)}px`);
      }

      widthCacheRef.current = {
        bodyViewport: bodyViewportWidth,
        columnHeadersContent: columnHeadersContentWidth,
      };
    });
    bodyViewportResizeObserver.observe(instance.refs.body.main.viewport.current);
    bodyViewportResizeObserver.observe(instance.refs.columnsHeader.main.content.current);

    return () => {
      bodyViewportResizeObserver.disconnect();
    }
  }, [instance, instance.refs.body.main.viewport, instance.refs.columnsHeader.main.content]);
}

import { CSSProperties, useRef, useState } from "react";
import clsx from "clsx";

import styles from "./DataGridBody.module.css";

import { useIsomorphicLayoutEffect } from "@/hooks/shared/useIsomorphicLayoutEffect";
import type { DataGridInstance } from "../types";
import DataGridRow from "./DataGridRow";
import NoRowsOverlay from "../components/NoRowsOverlay";
import { clamp } from "@/utils/math";

export interface DataGridBodyProps<TData extends unknown> {
  instance: DataGridInstance<TData>;
  ready?: boolean;
  style?: CSSProperties;
}

type FlexTracking = Record<string, { 
  flex: number; 
  minSize: number;
  size: number;
  maxSize: number;
}>;

const DataGridBody = <TData extends unknown>({
  instance, 
  ready,
  style,
}: DataGridBodyProps<TData>) => {
  const cachedWidthRef = useRef({
    viewport: 0,
    content: 0,
  });
  const flexTracking = useRef<FlexTracking | null>(null);

  useIsomorphicLayoutEffect(() => {
    instance.scrolls.main.horizontal.current?.syncScroll({ ref: instance.refs.body.main.viewport, mode: "scroll" });
    instance.scrolls.main.vertical.current?.syncScroll({ ref: instance.refs.body.main.viewport, mode: "scroll" });

    return () => {
      instance.scrolls.main.horizontal.current?.desyncScroll(instance.refs.body.main.viewport);
      instance.scrolls.main.vertical.current?.desyncScroll(instance.refs.body.main.viewport);
    };
  }, [instance.scrolls.main.horizontal, instance.scrolls.main.vertical, instance.refs.body.main.viewport]);

  useIsomorphicLayoutEffect(() => {
    if (!instance.refs.body.main.viewport.current || !instance.refs.body.main.content.current) return;
    
    const bodyViewportResizeObserver = new ResizeObserver((entries, observer) => {
      if (!instance.refs.body.main.viewport.current || !instance.refs.body.main.content.current) return;

      const bodyViewportWidth = instance.refs.body.main.viewport.current.clientWidth;
      const bodyContentWidth = instance.refs.body.main.content.current.clientWidth;
      const totalSize = instance.getTotalSize();
      const fillerSize = bodyViewportWidth - totalSize;
      instance.refs.body.main.viewport.current.style.setProperty("--dg-filler-cell-width", `${Math.max(0, fillerSize)}px`);

      // Calculate flex for each leaf column
      if (bodyViewportWidth !== cachedWidthRef.current.viewport
        || bodyContentWidth !== cachedWidthRef.current.content) {
        const cols = instance.getAllLeafColumns().map(col => ({
          id: col.id,
          def: col.columnDef,
        }));
        const sizing = instance.getState().columnSizing;
        if (!flexTracking.current) {
          const flexCols = cols.filter(col => col.def.flex);
          flexTracking.current = flexCols.reduce((acc, col) => {
            if (!sizing[col.id]) {
              acc[col.id] = { 
                flex: col.def.flex!, 
                size: col.def.size ?? 0,
                minSize: col.def.minSize!,
                maxSize: col.def.maxSize!,
              };
            }
            return acc;
          }, {} as FlexTracking);
        }
        else {
          Object.entries(flexTracking.current).forEach(([id, col]) => {
            if (sizing[id] && sizing[id] !== col.size)
              delete flexTracking.current![id];
          });
        }
        const flex = Object.values(flexTracking.current).reduce((acc, col) => acc + col.flex, 0);
        if (flex > 0) {
          const nonFlexWidth = cols.reduce((acc, col) => {
            if (!flexTracking.current![col.id])
              return acc + (sizing[col.id] ?? col.def.size ?? 0)
            return acc;
          }, 0);
          const remainingWidth = bodyViewportWidth - nonFlexWidth;
          const widthPerFlex = remainingWidth / flex;
          const newWidths = Object.entries(flexTracking.current).reduce((acc, [id, col]) => {
            return {
              ...acc,
              [id]: clamp(widthPerFlex * col.flex, col.minSize, col.maxSize),
            };
          }, sizing);
          Object.keys(flexTracking.current).forEach(id => {
            flexTracking.current![id].size = newWidths[id];
          });
          instance.setColumnSizing(newWidths);
        }
      }

      cachedWidthRef.current = {
        viewport: bodyViewportWidth,
        content: bodyContentWidth,
      };
    });
    bodyViewportResizeObserver.observe(instance.refs.body.main.viewport.current);
    bodyViewportResizeObserver.observe(instance.refs.body.main.content.current);

    return () => {
      bodyViewportResizeObserver.disconnect();
    }
  }, [instance, instance.refs.body.main.viewport, instance.refs.body.main.content]);

  return (
    // Viewport
    <div
      ref={instance.refs.body.main.viewport}
      className={clsx("DataGridBody-root DataGridBody-viewport", styles.root, instance.options.classNames?.body?.root)}
      style={{
        ...instance.options.styles?.body?.root,
        ...style,
      }}
      onWheel={e => {
        instance.scrolls.main.horizontal.current?.onWheel(e);
        instance.scrolls.main.vertical.current?.onWheel(e);
      }}
      onPointerDown={e => {
        instance.scrolls.main.horizontal.current?.onPointerDown(e);
        instance.scrolls.main.vertical.current?.onPointerDown(e);
      }}
      onPointerMove={e => {
        instance.scrolls.main.horizontal.current?.onPointerMove(e);
        instance.scrolls.main.vertical.current?.onPointerMove(e);
      }}
      onPointerUp={e => {
        instance.scrolls.main.horizontal.current?.onPointerUp(e);
        instance.scrolls.main.vertical.current?.onPointerUp(e);
      }}
    >
      {/* Content */}
      <div
        ref={instance.refs.body.main.content}
        className={clsx("DataGridBody-rowsContainer", styles.rowsContainer, instance.options.classNames?.body?.container)}
        style={{
          ...instance.options.styles?.body?.container,
          width: instance.options.enableColumnsVirtualization 
            ? instance.scrolls.virtualizers.columns.current?.getTotalSize()
            // : instance.getTotalSize() + (fillerSize > 0 ? fillerSize : 0),
            : `calc(${instance.getTotalSize()}px + var(--dg-filler-cell-width, 0))`,
          height: instance.options.enableRowsVirtualization
            ? instance.scrolls.virtualizers.rows.current?.getTotalSize()
            : undefined,
        }}
        role="rowgroup"
      >
        {ready ? (
          // Rows
          instance.options.enableRowsVirtualization
          ? instance.scrolls.virtualizers.rows.current?.getVirtualItems().map(virtualRow => {
            const row = instance.getRowModel().rows[virtualRow.index];
            return (
              <DataGridRow 
                key={row.id} 
                instance={instance}
                row={row} 
                rowIndex={virtualRow.index}
                style={{
                  // height: virtualRow.size,
                  position : "absolute",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                vRowEnd={virtualRow.end}
              />
            )
          }) 
          : instance.getRowModel().rows.map((row, rowIdx) => (
            <DataGridRow 
              key={row.id} 
              instance={instance}
              row={row} 
              rowIndex={rowIdx}
            />
          ))
        ) : null}
      </div>

      {!instance.getState().loading && instance.getRowModel().rows.length === 0 ? (
        <div className={clsx("DataGrid-overlay DataGrid-overlayEmpty", styles.overlay)}>
          {instance.options.slots?.noRowsOverlay ? (
            instance.options.slots.noRowsOverlay()
          ) : (
            <NoRowsOverlay />
          )}
        </div>
      ) : null}
    </div>
  );
}

export default DataGridBody;


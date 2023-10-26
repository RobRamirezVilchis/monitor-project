import { CSSProperties, useState } from "react";
import clsx from "clsx";

import styles from "./DataGridBody.module.css";

import { useIsomorphicLayoutEffect } from "@/hooks/shared/useIsomorphicLayoutEffect";
import type { DataGridInstance } from "../types";
import DataGridRow from "./DataGridRow";
import NoRowsOverlay from "../components/NoRowsOverlay";

export interface DataGridBodyProps<TData extends unknown> {
  instance: DataGridInstance<TData>;
  ready?: boolean;
  style?: CSSProperties;
}

const DataGridBody = <TData extends unknown>({
  instance, 
  ready,
  style,
}: DataGridBodyProps<TData>) => {
  const [fillerSize, setFillerSize] = useState<number>(0);

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
      if (!instance.refs.body.main.viewport.current) return;
      const bodyViewportWidth = instance.refs.body.main.viewport.current.clientWidth; // entries[0].contentRect.width;
      const totalSize = instance.getTotalSize();
      const fillerSize = bodyViewportWidth - totalSize;
      setFillerSize(fillerSize);
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
            : instance.getTotalSize() + (fillerSize > 0 ? fillerSize : 0),
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
                fillerSize={fillerSize}
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
              fillerSize={fillerSize}
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


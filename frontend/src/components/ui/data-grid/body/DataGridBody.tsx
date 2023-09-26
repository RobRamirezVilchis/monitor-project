import { useState } from "react";
import clsx from "clsx";

import gridBodyStyles from "./DataGridBody.module.css";

import { useIsomorphicLayoutEffect } from "@/hooks/shared/useIsomorphicLayoutEffect";
import type { DataGridInstance } from "../types";
import DataGridRow from "./DataGridRow";
import LoadingOverlay from "@/components/ui/data-grid/components/LoadingOverlay";
import Scroll from "@/components/ui/data-grid/components/Scroll";

export interface DataGridBodyProps<TData extends unknown> {
  instance: DataGridInstance<TData>;
  loading?: boolean;
}

const DataGridBody = <TData extends unknown>({
  instance, 
  loading,
}: DataGridBodyProps<TData>) => {
  const [contentRect, setContentRect] = useState({ 
    width: 0, 
    height: 0,
  });
  
  useIsomorphicLayoutEffect(() => {
    instance.scrolls.main.horizontal.current?.syncScroll(instance.refs.content.main);
    instance.scrolls.main.vertical.current?.syncScroll(instance.refs.content.main);

    if (!instance.refs.content.main.current) return;

    const contentResizeObserver = new ResizeObserver((entries, observer) => {
      const content = entries[0].target as HTMLDivElement;
      setContentRect({ 
        width: content.offsetWidth ?? 0, 
        height: content.offsetHeight ?? 0
      });
    });
    contentResizeObserver.observe(instance.refs.content.main.current!);

    return () => {
      contentResizeObserver.disconnect();
      instance.scrolls.main.horizontal.current?.desyncScroll(instance.refs.content.main);
      instance.scrolls.main.vertical.current?.desyncScroll(instance.refs.content.main);
    };
  }, [instance.refs, instance.scrolls]);

  const rowModel = instance.getRowModel();

  // Wrapper
  return (
    <div
      className={clsx("DataGridBody-root", gridBodyStyles.root, instance.options.classNames?.body?.root)}
      style={instance.options.styles?.body?.root}
    >
      {/* Viewport */}
      <div
        className={clsx("DataGridBody-viewport", gridBodyStyles.viewport, instance.options.classNames?.body?.viewport)}
        style={instance.options.styles?.body?.viewport}
        onWheel={e => {
          instance.scrolls.main.horizontal.current?.onWheel(e);
          instance.scrolls.main.vertical.current?.onWheel(e);
        }}
        onTouchStart={e => {
          instance.scrolls.main.horizontal.current?.onTouchStart(e);
          instance.scrolls.main.vertical.current?.onTouchStart(e);
        }}
        onTouchMove={e => {
          instance.scrolls.main.horizontal.current?.onTouchMove(e);
          instance.scrolls.main.vertical.current?.onTouchMove(e);
        }}
        onTouchEnd={e => {
          instance.scrolls.main.horizontal.current?.onTouchEnd(e);
          instance.scrolls.main.vertical.current?.onTouchEnd(e);
        }}
      >
        {/* Content */}
        <div
          className={clsx("DataGridBody-rowsContainer", gridBodyStyles.rowsContainer, instance.options.classNames?.body?.container)}
          style={{
            ...instance.options.styles?.body?.container,
            width: instance.options.enableColumnsVirtualization 
              ? instance.scrolls.virtualizers.columns.current?.getTotalSize()
              : instance.getTotalSize(),
            height: instance.options.enableRowsVirtualization
              ? instance.scrolls.virtualizers.rows.current?.getTotalSize()
              : undefined,
          }}
          ref={instance.refs.content.main}
        >
          {/* Rows */}
          {instance.options.enableRowsVirtualization
          ? instance.scrolls.virtualizers.rows.current?.getVirtualItems().map(virtualRow => {
            const row = rowModel.rows[virtualRow.index];
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
          : rowModel.rows.map((row, rowIdx) => (
            <DataGridRow 
              key={row.id} 
              instance={instance}
              row={row} 
              rowIndex={rowIdx}
            />
          ))}
        </div>
      </div>
      
      <Scroll
        orientation="vertical"
        virtualSize={contentRect.height}
        ref={instance.scrolls.main.vertical.current?.scrollRef}
        onScroll={instance.scrolls.main.vertical.current?.onScroll} 
      />
      <Scroll
        orientation="horizontal"
        virtualSize={contentRect.width}
        ref={instance.scrolls.main.horizontal.current?.scrollRef}
        onScroll={instance.scrolls.main.horizontal.current?.onScroll}
      />

      {loading ? <LoadingOverlay /> : null}
    </div>
  );
}

export default DataGridBody;


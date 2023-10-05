import { CSSProperties } from "react";
import clsx from "clsx";

import gridBodyStyles from "./DataGridBody.module.css";

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

  useIsomorphicLayoutEffect(() => {
    instance.scrolls.main.horizontal.current?.syncScroll(instance.refs.content.main);
    instance.scrolls.main.vertical.current?.syncScroll(instance.refs.content.main);

    return () => {
      instance.scrolls.main.horizontal.current?.desyncScroll(instance.refs.content.main);
      instance.scrolls.main.vertical.current?.desyncScroll(instance.refs.content.main);
    };
  }, [instance.refs, instance.scrolls]);

  const rowModel = instance.getRowModel();

  return (
    // Viewport
    <div
      className={clsx("DataGridBody-root DataGridBody-viewport", gridBodyStyles.root, instance.options.classNames?.body?.root)}
      style={{
        ...instance.options.styles?.body?.root,
        ...style,
      }}
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
        ref={instance.refs.content.main}
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
        role="rowgroup"
      >
        {ready ? (
          // Rows
          instance.options.enableRowsVirtualization
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
          ))
        ) : null}
      </div>

      {!instance.getState().loading && rowModel.rows.length === 0 ? (
        <div className={clsx("DataGridBody-overlay DataGridBody-overlayEmpty", gridBodyStyles.overlay)}>
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


import { CSSProperties } from "react";
import clsx from "clsx";

import styles from "./DataGridBody.module.css";

import type { DataGridInstance } from "../types";
import { useIsomorphicLayoutEffect } from "@/hooks/shared/useIsomorphicLayoutEffect";
import { useFlexColumns } from "../useFlexColumns";
import DataGridRow from "./DataGridRow";
import NoRowsOverlay from "../components/overlays/NoRowsOverlay";
import NoResultsOverlay from "../components/overlays/NoResultsOverlay";
import DataGridOverlay from "../components/overlays/DataGridOverlay";

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
  useFlexColumns(instance);

  useIsomorphicLayoutEffect(() => {
    instance.scrolls.main.horizontal.current?.syncScroll({ ref: instance.refs.body.main.viewport, mode: "scroll" });
    instance.scrolls.main.vertical.current?.syncScroll({ ref: instance.refs.body.main.viewport, mode: "scroll" });

    return () => {
      instance.scrolls.main.horizontal.current?.desyncScroll(instance.refs.body.main.viewport);
      instance.scrolls.main.vertical.current?.desyncScroll(instance.refs.body.main.viewport);
    };
  }, [instance.scrolls.main.horizontal, instance.scrolls.main.vertical, instance.refs.body.main.viewport]);

  return (
    <div
      className={clsx("DataGridBody-root", styles.root, instance.options.classNames?.body?.root)}
    >
      {/* Viewport */}
      <div
        ref={instance.refs.body.main.viewport}
        className={clsx("DataGridBody-viewport", styles.viewport, instance.options.classNames?.body?.viewport)}
        style={{
          ...instance.options.styles?.body?.viewport,
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
      </div>

      {instance.getRowModel().rows.length === 0 ? (
        <DataGridOverlay
          className="DataGridOverlay--empty"
          onWheel={instance.scrolls.main.horizontal.current?.onWheel}
          onPointerDown={instance.scrolls.main.horizontal.current?.onPointerDown}
          onPointerMove={instance.scrolls.main.horizontal.current?.onPointerMove}
          onPointerUp={instance.scrolls.main.horizontal.current?.onPointerUp}
        >
          
          {instance.getState().globalFilter || instance.getState().columnFilters.length > 0 
          ? (instance.options.slots?.noResultsOverlay 
              ? <instance.options.slots.noResultsOverlay instance={instance} {...instance.options.slotProps?.noRowsOverlay} />
              : <NoResultsOverlay instance={instance as any} {...instance.options.slotProps?.noRowsOverlay} />
            )
          : (instance.options.slots?.noRowsOverlay 
              ? <instance.options.slots.noRowsOverlay instance={instance} {...instance.options.slotProps?.noResultsOverlay} />
              : <NoRowsOverlay  instance={instance as any} {...instance.options.slotProps?.noResultsOverlay} />
            )
          }
        </DataGridOverlay>
      ) : null}
    </div>
  );
}

export default DataGridBody;


import { ReactNode, useState } from "react";
import { Row } from "@tanstack/react-table";
import clsx from "clsx";

import gridBodyStyles from "./DataGridBody.module.css";

import { useDataGridContext } from "../providers/DataGridContext";
import { useDataGridRefsContext } from "../providers/DataGridRefsProvider";
import { useDataGridScrollContext } from "../providers/DataGridScrollProvider";
import { useIsomorphicLayoutEffect } from "@/hooks/shared/useIsomorphicLayoutEffect";
import DataGridRow from "./DataGridRow";
import LoadingOverlay from "@/components/ui/data-grid/components/LoadingOverlay";
import Scroll from "@/components/ui/data-grid/components/Scroll";
import type { DataGridInstance } from "../types";

export interface DataGridBodyProps<TData extends unknown> {
  instance: DataGridInstance<TData>;
  loading?: boolean;
  renderSubComponent?: (row: Row<TData>) => ReactNode;
}

const DataGridBody = <TData extends unknown>({
  instance, 
  loading,
  renderSubComponent,
}: DataGridBodyProps<TData>) => {
  const { classNames, styles } = useDataGridContext();
  const { mainScrollbars } = useDataGridScrollContext();
  const { contentRefs } = useDataGridRefsContext();
  const [contentRect, setContentRect] = useState({ 
    width: 0, 
    height: 0,
  });
  
  useIsomorphicLayoutEffect(() => {
    mainScrollbars.horizontal.syncScroll(contentRefs.main);
    mainScrollbars.vertical.syncScroll(contentRefs.main);

    if (!contentRefs.main.current) return;

    const contentResizeObserver = new ResizeObserver((entries, observer) => {
      const content = entries[0].target as HTMLDivElement;
      setContentRect({ 
        width: content.offsetWidth ?? 0, 
        height: content.offsetHeight ?? 0
      });
    });
    contentResizeObserver.observe(contentRefs.main.current);

    return () => {
      contentResizeObserver.disconnect();
      mainScrollbars.horizontal.desyncScroll(contentRefs.main);
      mainScrollbars.vertical.desyncScroll(contentRefs.main);
    };
  }, [contentRefs.main, mainScrollbars.horizontal, mainScrollbars.vertical]);

  const rowModel = instance.getRowModel();

  // Wrapper
  return (
    <div
      className={clsx("DataGridBody-root", gridBodyStyles.root, classNames?.body?.root)}
      style={styles?.body?.root}
    >
      {/* Viewport */}
      <div
        className={clsx("DataGridBody-viewport", gridBodyStyles.viewport, classNames?.body?.viewport)}
        style={styles?.body?.viewport}
        onWheel={e => {
          mainScrollbars.horizontal.onWheel(e);
          mainScrollbars.vertical.onWheel(e);
        }}
        onTouchStart={e => {
          mainScrollbars.horizontal.onTouchStart(e);
          mainScrollbars.vertical.onTouchStart(e);
        }}
        onTouchMove={e => {
          mainScrollbars.horizontal.onTouchMove(e);
          mainScrollbars.vertical.onTouchMove(e);
        }}
        onTouchEnd={e => {
          mainScrollbars.horizontal.onTouchEnd(e);
          mainScrollbars.vertical.onTouchEnd(e);
        }}
      >
        {/* Content */}
        <div
          className={clsx("DataGridBody-rowsContainer", gridBodyStyles.rowsContainer, classNames?.body?.rowsContainer)}
          style={{
            ...styles?.body?.rowsContainer,
            width: instance.getTotalSize(),
          }}
          ref={contentRefs.main}
        >
          {/* Rows */}
          {rowModel.rows.map((row, rowIdx) => (
            <DataGridRow 
              key={row.id} 
              row={row} 
              rowIndex={rowIdx}
              renderSubComponent={renderSubComponent} 
              // classNames={classNames?.row}
              // styles={styles?.row}
            />
          ))}
        </div>
      </div>
      
      <Scroll
        orientation="vertical"
        virtualSize={contentRect.height}
        ref={mainScrollbars.vertical.scrollRef}
        onScroll={mainScrollbars.vertical.onScroll} 
      />
      <Scroll
        orientation="horizontal"
        virtualSize={contentRect.width}
        ref={mainScrollbars.horizontal.scrollRef}
        onScroll={mainScrollbars.horizontal.onScroll}
      />

      {loading ? <LoadingOverlay /> : null}
    </div>
  );
}

export default DataGridBody;


import { ReactNode, useEffect, useRef, useState } from "react";
import { Row } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import clsx from "clsx";

import gridBodyStyles from "./DataGridBody.module.css";

import { useDataGridContext } from "../../providers/DataGridContext";
import { useDataGridDensity } from "../../providers/DensityContext";
import { useDataGridRefsContext } from "../../providers/DataGridRefsProvider";
import { useDataGridScrollContext } from "../../providers/DataGridScrollProvider";
import { useIsomorphicLayoutEffect } from "@/hooks/shared/useIsomorphicLayoutEffect";
import type { DataGridInstance } from "../../types";
import DataGridRow from "./DataGridRow";
import LoadingOverlay from "@/components/ui/data-grid/components/LoadingOverlay";
import Scroll from "@/components/ui/data-grid/components/Scroll";
import { useHorizontalVirtualizer, useVerticalVirtualizer } from "../../providers/DataGridVirtualizerProvider";

export interface DataGridBodyVirtualizedProps<TData extends unknown> {
  instance: DataGridInstance<TData>;
  loading?: boolean;
  renderSubComponent?: (row: Row<TData>) => ReactNode;
}

const DataGridBodyVirtualized = <TData extends unknown>({
  instance, 
  loading,
  renderSubComponent,
}: DataGridBodyVirtualizedProps<TData>) => {
  const { rowHeight } = useDataGridDensity();
  const { classNames, styles } = useDataGridContext();
  const { mainScrollbars } = useDataGridScrollContext();
  const { contentRefs } = useDataGridRefsContext();
  const [contentRect, setContentRect] = useState({ 
    width: 0, 
    height: 0,
  });

  const rowModel = instance.getRowModel();

  // const xVirtualizer = useVirtualizer({
  //   count: instance.getVisibleLeafColumns().length,
  //   overscan: 1,
  //   getScrollElement: () => xScroll.scrollRef.current,
  //   estimateSize: i => leafColumns[i].getSize(),
  //   horizontal: true,
  // });

  const prevRowHeight = useRef(rowHeight);
  const yVirtualizer = useVirtualizer({
    count: rowModel.rows.length,
    overscan: 1,
    getScrollElement: () => mainScrollbars.vertical.scrollRef.current,
    estimateSize: () => rowHeight,
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

  // useEffect(() => {
  //   if (prevRowHeight.current === rowHeight) return;
  //   prevRowHeight.current = rowHeight;
  //   yVirtualizer.measure();
  // }, [rowHeight, yVirtualizer])

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
          className={clsx("DataGridBody-rowsContainer", gridBodyStyles.rowsContainer, classNames?.body?.container)}
          style={{
            ...styles?.body?.container,
            width: instance.getTotalSize(),
            height: yVirtualizer?.getTotalSize(),
          }}
          ref={contentRefs.main}
        >
          {/* Rows */}
          {yVirtualizer?.getVirtualItems().map(virtualRow => {
            const row = rowModel.rows[virtualRow.index];

            return (
              <DataGridRow 
                key={row.id} 
                row={row} 
                rowIndex={virtualRow.index}
                renderSubComponent={renderSubComponent} 
                // classNames={classNames?.row}
                // styles={styles?.row}
                style={{
                  position: "absolute",
                  height: virtualRow.size,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              />
            )
          })}
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

export default DataGridBodyVirtualized;


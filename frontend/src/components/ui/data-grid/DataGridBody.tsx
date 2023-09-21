import { CSSProperties, ReactNode, useState } from "react";
import { 
  Row, 
} from "@tanstack/react-table";
import clsx from "clsx";

import gridBodyStyles from "./DataGridBody.module.css";

import { useIsomorphicLayoutEffect } from "@/hooks/shared/useIsomorphicLayoutEffect";
import { useDataGridContext } from "./DataGridContext";
import type { DataGridDensity, DataGridInstance } from "./types";
import DataGridRow, {
  type DataGridRowClassNames,
  type DataGridRowStyles,
} from "./DataGridRow";
import LoadingOverlay from "@/components/ui/data-grid/components/LoadingOverlay";
import Scroll from "@/components/ui/data-grid/components/Scroll";

export interface DataGridBodyClassNames {
  root?: string;
  viewport?: string;
  rowsContainer?: string;
  row?: DataGridRowClassNames;
}

export interface DataGridBodyStyles {
  root?: CSSProperties;
  viewport?: CSSProperties;
  rowsContainer?: CSSProperties;
  row?: DataGridRowStyles;
}

export interface DataGridBodyProps<TData extends unknown> {
  instance: DataGridInstance<TData>;
  loading?: boolean;
  density?: DataGridDensity;
  classNames?: DataGridBodyClassNames;
  styles?: DataGridBodyStyles;
  renderSubComponent?: (row: Row<TData>) => ReactNode;
}

const DataGridBody = <TData extends unknown>({
  instance, 
  loading,
  density = "normal",
  classNames,
  styles,
  renderSubComponent,
}: DataGridBodyProps<TData>) => {
  const { mainXScroll, mainYScroll } = useDataGridContext();
  const [contentRect, setContentRect] = useState({ 
    width: 0, 
    height: 0,
  });
  
  useIsomorphicLayoutEffect(() => {
    mainXScroll.syncScroll(instance.refs.content.main);
    mainYScroll.syncScroll(instance.refs.content.main);

    if (!instance.refs.content.main.current) return;

    const contentResizeObserver = new ResizeObserver((entries, observer) => {
      const content = entries[0].target as HTMLDivElement;
      setContentRect({ 
        width: content.offsetWidth ?? 0, 
        height: content.offsetHeight ?? 0
      });
    });
    contentResizeObserver.observe(instance.refs.content.main.current);

    return () => {
      contentResizeObserver.disconnect();
      mainXScroll.desyncScroll(instance.refs.content.main);
      mainYScroll.desyncScroll(instance.refs.content.main);
    };
  }, [instance.refs.content, mainXScroll, mainYScroll]);

  const rowModel = instance.getRowModel();

  // Wrapper
  return (
    <div
      className={clsx("DataGridBody-root", gridBodyStyles.root, classNames?.root)}
      style={styles?.root}
    >
      {/* Viewport */}
      <div
        className={clsx("DataGridBody-viewport", gridBodyStyles.viewport, classNames?.viewport)}
        style={styles?.viewport}
        onWheel={e => {
          mainXScroll.onWheel(e);
          mainYScroll.onWheel(e);
        }}
        onTouchStart={e => {
          mainXScroll.onTouchStart(e);
          mainYScroll.onTouchStart(e);
        }}
        onTouchMove={e => {
          mainXScroll.onTouchMove(e);
          mainYScroll.onTouchMove(e);
        }}
        onTouchEnd={e => {
          mainXScroll.onTouchEnd(e);
          mainYScroll.onTouchEnd(e);
        }}
      >
        {/* Content */}
        <div
          className={clsx("DataGridBody-rowsContainer", gridBodyStyles.rowsContainer, classNames?.rowsContainer)}
          style={{
            ...styles?.rowsContainer,
            width: instance.getTotalSize(),
          }}
          ref={instance.refs.content.main}
        >
          {/* Rows */}
          {rowModel.rows.map((row, rowIdx) => (
            <DataGridRow 
              key={row.id} 
              row={row} 
              rowIndex={rowIdx}
              density={density}
              renderSubComponent={renderSubComponent} 
              classNames={classNames?.row} 
              styles={styles?.row} 
            />
          ))}
        </div>
      </div>
      <Scroll orientation="vertical" virtualSize={contentRect.height} ref={mainYScroll.scrollRef} onScroll={mainYScroll.onScroll} />
      <Scroll orientation="horizontal" virtualSize={contentRect.width} ref={mainXScroll.scrollRef} onScroll={mainXScroll.onScroll} />

      {loading ? <LoadingOverlay /> : null}
    </div>
  );
}

export default DataGridBody;


import { useEffect, useState } from "react";
import { RowData } from "@tanstack/react-table";
import clsx from "clsx";

import styles from "./DataGrid.module.css";

import type { DataGridInstance } from "./types";
import { useIsomorphicLayoutEffect } from "@/hooks/shared/useIsomorphicLayoutEffect";
import DataGridColumnHeaders from "./column-headers/DataGridColumnHeaders";
import DataGridBody from "./body/DataGridBody";
import DataGridColumnFooter from "./column-footer/DataGridColumnFooter";
import DataGridFooter from "./footer/DataGridFooter";
import DataGridToolbar from "./toolbar/DataGridToolbar";
import Scroll from "@/components/ui/data-grid/components/Scroll";
import SpinnerLoadingOverlay from "@/components/ui/data-grid/components/SpinnerLoadingOverlay";

export interface DataGridProps<TData extends RowData> {
  instance: DataGridInstance<TData>;
}

const DataGrid = <TData extends RowData>({
  instance,
}: DataGridProps<TData>) => {
  const [ready, setReady] = useState(false);
  const [contentRect, setContentRect] = useState({ 
    width: 0, 
    height: 0,
  });
  
  useIsomorphicLayoutEffect(() => {
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
    };
  }, [instance.refs]);

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <div 
      className={clsx("DataGrid", styles.root, { 
        [styles.fullscreen]: instance.fullscreen 
      }, instance.options.classNames?.root)} 
      style={instance.options.styles?.root}
      role="grid"
    >
      {instance.options.hideToolbar ? null : (
        <div
          ref={instance.refs.header}
          className={clsx("DataGrid-toolbarContainer", styles.toolbarContainer, instance.options.classNames?.toolbarContainer)}
          style={instance.options.styles?.toolbarContainer}
        >
          {instance.options.slots?.toolbar 
          ? instance.options.slots.toolbar({instance})
          : <DataGridToolbar instance={instance} />}
        </div>
      )}

      <div
        className={clsx("DataGrid-mainContainer", styles.mainContainer, instance.options.classNames?.mainContainer)}
        style={instance.options.styles?.mainContainer}
      >
        <DataGridColumnHeaders 
          instance={instance}
          style={{
            gridColumn: "1 / 3",
            gridRow: "1 / 2",
          }}
        />

        <DataGridBody
          instance={instance}
          ready={ready}
          style={{
            gridColumn: "1 / 2",
            gridRow: "2 / 3",
          }}
        />

        <Scroll
          orientation="vertical"
          virtualSize={contentRect.height}
          ref={instance.scrolls.main.vertical.current?.scrollRef}
          onScroll={instance.scrolls.main.vertical.current?.onScroll}
          thickness={instance.options.slotProps?.scroll?.thickness}
          style={{
            gridColumn: "2 / 3",
            gridRow: "2 / 3",
          }}
        />
        
        <DataGridColumnFooter 
          instance={instance} 
          style={{
            gridColumn: "1 / 3",
            gridRow: "3 / 4",
          }}
        />

        <Scroll
          orientation="horizontal"
          virtualSize={contentRect.width}
          ref={instance.scrolls.main.horizontal.current?.scrollRef}
          onScroll={instance.scrolls.main.horizontal.current?.onScroll}
          thickness={instance.options.slotProps?.scroll?.thickness}
          style={{
            gridColumn: "1 / 2",
            gridRow: "4 / 5",
          }}
        />

        {instance.options.loading || !ready ? (
          <div className={clsx("DataGridBody-overlay DataGridBody-overlayLoading", styles.overlay)}>
            {instance.options.slots?.loadingOverlay ? (
              instance.options.slots.loadingOverlay()
            ) : (
              <SpinnerLoadingOverlay />
            )}
          </div>
        ) : null}
      </div>

      {instance.options.hideFooter ? null : (
        <div
          ref={instance.refs.footer}
          className={clsx("DataGrid-footerContainer", styles.footerContainer, instance.options.classNames?.footerContainer)}
          style={instance.options.styles?.footerContainer}
        >
          <DataGridFooter instance={instance} />
        </div>
      )}
    </div>
  );
};

export default DataGrid;

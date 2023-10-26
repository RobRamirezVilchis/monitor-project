import { useEffect, useState } from "react";
import { RowData } from "@tanstack/react-table";
import clsx from "clsx";

import styles from "./DataGrid.module.css";

import type { DataGridInstance } from "./types";
import { useIsomorphicLayoutEffect } from "@/hooks/shared/useIsomorphicLayoutEffect";
import { mergeRefs } from "@/hooks/utils/useMergedRef";
import DataGridColumnHeaders from "./column-headers/DataGridColumnHeaders";
import DataGridBody from "./body/DataGridBody";
import DataGridColumnFooters from "./column-footers/DataGridColumnFooters";
import DataGridFooter from "./footer/DataGridFooter";
import DataGridToolbar from "./toolbar/DataGridToolbar";
import Scroll from "@/components/ui/data-grid/scroll/Scroll";
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
    if (!instance.refs.body.main.content.current) return;

    const contentResizeObserver = new ResizeObserver((entries, observer) => {
      const content = entries[0].target as HTMLDivElement;
      setContentRect({ 
        width: content.offsetWidth ?? 0, 
        height: content.offsetHeight ?? 0
      });
    });
    contentResizeObserver.observe(instance.refs.body.main.content.current);

    return () => {
      contentResizeObserver.disconnect();
    };
  },  [instance.refs.body.main.content]);

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <div 
      ref={mergeRefs(instance.refs.root, instance.scrolls.main.horizontal.current?.scrollRootContainerRef!, instance.scrolls.main.vertical.current?.scrollRootContainerRef!)}
      className={clsx("DataGrid", {
        "DataGrid--fullscreen": instance.getState().fullscreen,
      }, styles.root, instance.options.classNames?.root)} 
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
        onPointerEnter={e => {
          instance.scrolls.main.horizontal.current?.shouldLockScroll(true);
          instance.scrolls.main.vertical.current?.shouldLockScroll(true);
        }}
        onPointerLeave={e => {
          instance.scrolls.main.horizontal.current?.shouldLockScroll(false);
          instance.scrolls.main.vertical.current?.shouldLockScroll(false);
        }}
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
        
        {instance.options.hideColumnFooters ? null : (
          <DataGridColumnFooters
            instance={instance} 
            style={{
              gridColumn: "1 / 3",
              gridRow: "3 / 4",
            }}
          />
        )}

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

        {instance.getState().loading || !ready ? (
          <div className={clsx("DataGrid-overlay DataGrid-overlayLoading", styles.overlay)}>
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

import { CSSProperties } from "react";
import clsx from "clsx";

import styles from "./DataGridColumnFooters.module.css";

import { useIsomorphicLayoutEffect } from "@/hooks/shared/useIsomorphicLayoutEffect";
import type { DataGridInstance } from "../types";
import DataGridColumnFootersGroup from "./DataGridColumnFootersGroup";

export interface DataGridColumnFootersProps<TData extends unknown> {
  instance: DataGridInstance<TData>;
  style?: CSSProperties;
}

const DataGridColumnFooters = <TData extends unknown>({
  instance,
  style,
}: DataGridColumnFootersProps<TData>) => {
  const footerGroups = instance.getFooterGroups();

  useIsomorphicLayoutEffect(() => {
    instance.scrolls.main.horizontal.current?.syncScroll({ ref: instance.refs.columnFooters.main.content, mode: "translate" });

    return () => {
      instance.scrolls.main.horizontal.current?.desyncScroll(instance.refs.columnFooters.main.content);
    };
  }, [instance.scrolls.main.horizontal, instance.refs.columnFooters.main.content]);

  // Viewport
  return (
    <div
      ref={instance.refs.columnFooters.main.viewport}
      className={clsx("DataGridColumnFooters-root DataGridColumnFooters-viewport", styles.root, instance.options.classNames?.columnFooters?.root)}
      style={{
        ...instance.options.styles?.columnFooters?.root,
        ...style,
      }}
      onWheel={instance.scrolls.main.horizontal.current?.onWheel}
      onPointerDown={instance.scrolls.main.horizontal.current?.onPointerDown}
      onPointerMove={instance.scrolls.main.horizontal.current?.onPointerMove}
      onPointerUp={instance.scrolls.main.horizontal.current?.onPointerUp}
      role="rowgroup"
    >
      <div
        ref={instance.refs.columnFooters.main.content}
        className={clsx("DataGridColumnFooters-container", styles.container, instance.options.classNames?.columnFooters?.container)}
        style={{
          ...instance.options.styles?.columnFooters?.container,
          width: instance.getTotalSize(),
        }}
      >
        {/* Groups */}
        {footerGroups.map(group => (
          <DataGridColumnFootersGroup 
            key={group.id} 
            instance={instance}
            group={group} 
          />
        ))}
      </div>
    </div>
  )
}

export default DataGridColumnFooters;

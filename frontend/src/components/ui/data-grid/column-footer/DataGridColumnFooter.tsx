import clsx from "clsx";

import gridColumnFooterStyles from "./DataGridColumnFooter.module.css";

import { useIsomorphicLayoutEffect } from "@/hooks/shared/useIsomorphicLayoutEffect";
import type { DataGridInstance } from "../types";
import DataGridColumnFooterGroup from "./DataGridColumnFooterGroup";

export interface DataGridColumnFooterProps<TData extends unknown> {
  instance: DataGridInstance<TData>;
  style?: React.CSSProperties;
}

const DataGridColumnFooter = <TData extends unknown>({
  instance,
  style,
}: DataGridColumnFooterProps<TData>) => {
  const footerGroups = instance.getFooterGroups();

  useIsomorphicLayoutEffect(() => {
    instance.scrolls.main.horizontal.current?.syncScroll({ ref: instance.refs.columnsFooter.main.content, mode: "translate" });

    return () => {
      instance.scrolls.main.horizontal.current?.desyncScroll(instance.refs.columnsFooter.main.content);
    };
  }, [instance.scrolls.main.horizontal, instance.refs.columnsFooter.main.content]);

  // Viewport
  return (
    <div
      ref={instance.refs.columnsFooter.main.viewport}
      className={clsx("DataGridColumnFooter-root DataGridColumnFooter-viewport", gridColumnFooterStyles.root, instance.options.classNames?.columnFooter?.root)}
      style={{
        ...instance.options.styles?.columnFooter?.root,
        ...style,
      }}
      onWheel={instance.scrolls.main.horizontal.current?.onWheel}
      onPointerDown={instance.scrolls.main.horizontal.current?.onPointerDown}
      onPointerMove={instance.scrolls.main.horizontal.current?.onPointerMove}
      onPointerUp={instance.scrolls.main.horizontal.current?.onPointerUp}
      role="rowgroup"
    >
      <div
        ref={instance.refs.columnsFooter.main.content}
        className={clsx("DataGridColumnFooter-container", gridColumnFooterStyles.container, instance.options.classNames?.columnFooter?.container)}
        style={{
          ...instance.options.styles?.columnFooter?.container,
          width: instance.getTotalSize(),
        }}
      >
        {/* Groups */}
        {footerGroups.map(group => (
          <DataGridColumnFooterGroup 
            key={group.id} 
            instance={instance}
            group={group} 
          />
        ))}
      </div>
    </div>
  )
}

export default DataGridColumnFooter;

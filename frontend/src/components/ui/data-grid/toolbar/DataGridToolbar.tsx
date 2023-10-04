import { RowData } from "@tanstack/react-table";
import clsx from "clsx";

import styles from "./DataGridToolbar.module.css";

import type { DataGridInstance } from "../types";
import ToolbarColumnVisibilityToggle from "./ToolbarColumnVisibilityToggle";
import ToolbarQuickFilter from "./ToolbarQuickFilter";
import ToolbarFullscreenToggle from "./ToolbarFullscreenToggle";
import ToolbarDensityToggle from "./ToolbarDensityToggle";
import ToolbarFilterToggle from "./ToolbarFIlterToggle";

export interface DataGridHeaderProps<TData extends RowData> {
  instance: DataGridInstance<TData>;
}

const DataGridHeader = <TData extends RowData>({
  instance,
}: DataGridHeaderProps<TData>) => {
  return (
    <div 
      className={clsx("DataGridToolbar-root", styles.root, instance.options.classNames?.toolbar?.root)}
      style={instance.options.styles?.toolbar?.root}
    >
      {instance.options.hideToolbar ? null : 
        instance.options.slots?.toolbar ? (
          instance.options.slots.toolbar({instance})
        ) : (
          <>
          <div
            className={clsx("DataGridToolbar-leftContainer", styles.left, instance.options.classNames?.toolbar?.leftContainer)}
            style={instance.options.styles?.toolbar?.leftContainer}
          >
            {instance.options.hideQuickSearch ? null : <ToolbarQuickFilter instance={instance} />}
          </div>

          <div
            className={clsx("DataGridToolbar-rightContainer", styles.right, instance.options.classNames?.toolbar?.rightContainer)}
            style={instance.options.styles?.toolbar?.rightContainer}
          >
            {instance.options.hideColumnFiltersSelector ? null : <ToolbarFilterToggle instance={instance} />}
            {instance.options.hideColumnSelector        ? null : <ToolbarColumnVisibilityToggle instance={instance} />}
            {instance.options.hideDensitySelector       ? null : <ToolbarDensityToggle instance={instance} />}
            {instance.options.hideFullscreenSelector    ? null : <ToolbarFullscreenToggle instance={instance} />}
          </div>
          </>
        )
      }
    </div>
  )
}

export default DataGridHeader;

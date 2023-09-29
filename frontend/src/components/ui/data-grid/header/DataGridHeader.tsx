import { RowData } from "@tanstack/react-table";
import clsx from "clsx";

import gridHeaderStyles from "./DataGridHeader.module.css";

import type { DataGridInstance } from "../types";
import ToolbarColumnVisibilityToggle from "../components/data-grid-toolbar/ToolbarColumnVisibilityToggle";
import ToolbarQuickFilter from "../components/data-grid-toolbar/ToolbarQuickFilter";
import DataGridToolbar from "../components/data-grid-toolbar/DataGridToolbar";
import DataGridToolbarLeftContent from "../components/data-grid-toolbar/DataGridToolbarLeftContent";
import DataGridToolbarRightContent from "../components/data-grid-toolbar/DataGridToolbarRightContent";
import ToolbarFullscreenToggle from "../components/data-grid-toolbar/ToolbarFullscreenToggle";
import ToolbarDensityToggle from "../components/data-grid-toolbar/ToolbarDensityToggle";
import ToolbarFilterToggle from "../components/data-grid-toolbar/ToolbarFIlterToggle";

export interface DataGridHeaderProps<TData extends RowData> {
  instance: DataGridInstance<TData>;
}

const DataGridHeader = <TData extends RowData>({
  instance,
}: DataGridHeaderProps<TData>) => {
  return (
    <div
      ref={instance.refs.header}
      className={clsx("DataGridHeader-root", gridHeaderStyles.root, instance.options.classNames?.header?.root)}
      style={instance.options.styles?.header?.root}
    >
      <div 
        className={clsx("DataGridHeader-contentContainer", gridHeaderStyles.contentContainer, instance.options.classNames?.header?.contentContainer)}
        style={instance.options.styles?.header?.contentContainer}
      >
        {/* TODO: Add custom content? */}
        {/* <div
          className={clsx("DataGridHeader-content", gridHeaderStyles.content, instance.options.classNames?.header?.content)}
          style={instance.options.styles?.header?.content}
        >
          
        </div> */}

        {instance.options.hideToolbar ? null : 
          instance.options.slots?.toolbar ? (
            instance.options.slots.toolbar({instance})
          ) : (
            <DataGridToolbar instance={instance}>
              <DataGridToolbarLeftContent instance={instance}>
                {instance.options.hideQuickSearch ? null : <ToolbarQuickFilter instance={instance} />}
              </DataGridToolbarLeftContent>
  
              <DataGridToolbarRightContent instance={instance}>
                {instance.options.hideColumnFiltersSelector ? null : <ToolbarFilterToggle instance={instance} />}
                {instance.options.hideColumnSelector        ? null : <ToolbarColumnVisibilityToggle instance={instance} />}
                {instance.options.hideDensitySelector       ? null : <ToolbarDensityToggle instance={instance} />}
                {instance.options.hideFullscreenSelector    ? null : <ToolbarFullscreenToggle instance={instance} />}
              </DataGridToolbarRightContent>
            </DataGridToolbar>
          )
        }
      </div>
    </div>
  )
}

export default DataGridHeader;

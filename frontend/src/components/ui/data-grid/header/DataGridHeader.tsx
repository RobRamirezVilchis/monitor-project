import { RowData } from "@tanstack/react-table";
import clsx from "clsx";

import gridHeaderStyles from "./DataGridHeader.module.css";

import ToolbarColumnVisibilityToggle from "../components/DataGridToolbar/ToolbarColumnVisibilityToggle";
import ToolbarQuickFilter from "../components/DataGridToolbar/ToolbarQuickFilter";
import type { DataGridInstance } from "../types";


import ToolbarDensityToggle from "../components/DataGridToolbar/ToolbarDensityToggle";
import ToolbarFullscreenToggle from "../components/DataGridToolbar/ToolbarFullscreenToggle";
import DataGridToolbar from "../components/DataGridToolbar/DataGridToolbar";
import DataGridToolbarLeftContent from "../components/DataGridToolbar/DataGridToolbarLeftContent";
import DataGridToolbarRightContent from "../components/DataGridToolbar/DataGridToolbarRightContent";

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
                {instance.options.hideColumnSelector     ? null : <ToolbarColumnVisibilityToggle instance={instance} />}
                {instance.options.hideDensitySelector    ? null : <ToolbarDensityToggle instance={instance} />}
                {instance.options.hideFullscreenSelector ? null : <ToolbarFullscreenToggle instance={instance} />}
              </DataGridToolbarRightContent>
            </DataGridToolbar>
          )
        }
      </div>
    </div>
  )
}

export default DataGridHeader;

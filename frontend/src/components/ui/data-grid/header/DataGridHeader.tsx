import { RowData } from "@tanstack/react-table";
import clsx from "clsx";

import gridHeaderStyles from "./DataGridHeader.module.css";

import ColumnVisibility from "../components/ColumnVisibility";
import QuickFilter from "../components/QuickFilter";
import type { DataGridInstance } from "../types";


import DensityToggle from "../components/DensityToggle";

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
        <div
          className={clsx("DataGridHeader-content", gridHeaderStyles.content, instance.options.classNames?.header?.content)}
          style={instance.options.styles?.header?.content}
        >
          <QuickFilter instance={instance} />
        </div>

        <div 
          className={clsx("DataGridHeader-toolbar", gridHeaderStyles.toolbar, instance.options.classNames?.header?.toolbar)}
          style={instance.options.styles?.header?.toolbar}
        >
          <ColumnVisibility instance={instance} />
          <DensityToggle instance={instance} />
        </div>
      </div>
    </div>
  )
}

export default DataGridHeader;

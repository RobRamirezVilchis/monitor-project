import { RowData } from "@tanstack/react-table";
import clsx from "clsx";

import gridFooterStyles from "./DataGridFooter.module.css";

import type { DataGridInstance } from "../types";
import GridPagination from "../components/GridPagination";

export interface DataGridFooterProps<TData extends RowData> {
  instance: DataGridInstance<TData>;
}

const DataGridFooter = <TData extends RowData>({
  instance,
}: DataGridFooterProps<TData>) => {
  const selectedRowModel = instance.getSelectedRowModel();

  return (
    <div
      ref={instance.refs.footer}
      className={clsx("DataGridFooter-root", gridFooterStyles.root, instance.options.classNames?.footer?.root)}
      style={instance.options.styles?.footer?.root}
    >
      <div 
        className={clsx("DataGridFooter-contentContainer", gridFooterStyles.contentContainer, instance.options.classNames?.footer?.contentContainer)}
        style={instance.options.styles?.footer?.contentContainer}
      >
        <div 
          className={clsx("DataGridFooter-content", gridFooterStyles.content, instance.options.classNames?.footer?.content)}
          style={instance.options.styles?.footer?.content}
        >
          {selectedRowModel.rows.length > 0 ? (
            <span>
              {selectedRowModel.rows.length} rows selected
            </span>
          ) : null}
        </div>

        <div
          className={clsx("DataGridFooter-pagination", gridFooterStyles.pagination, instance.options.classNames?.footer?.pagination)}
          style={instance.options.styles?.footer?.pagination}
        >
          {instance.options.slots?.pagination ? instance.options.slots.pagination({ instance }) : <GridPagination instance={instance} />}
        </div>
      </div>
    </div>
  )
}

export default DataGridFooter;

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
      className={clsx("DataGridFooter-root", gridFooterStyles.root, instance.options.classNames?.footer?.root)}
      style={instance.options.styles?.footer?.root}
    >
      {selectedRowModel.rows.length > 0 ? (
        <div 
          className={clsx("DataGridFooter-rowSelection", gridFooterStyles.rowSelection, instance.options.classNames?.footer?.rowSelection)}
          style={instance.options.styles?.footer?.rowSelection}
        >
            <span>
              {instance.localization.footerSelectedRowCount(selectedRowModel.rows.length)}
            </span>
        </div>
      ) : null}

      {instance.options.enablePagination ? (
        <div
          className={clsx("DataGridFooter-pagination", gridFooterStyles.pagination, instance.options.classNames?.footer?.pagination)}
          style={instance.options.styles?.footer?.pagination}
        >
          {instance.options.slots?.pagination 
          ? instance.options.slots.pagination({ instance }) 
          : <GridPagination instance={instance} />}
        </div>
      ) : null}
    </div>
  )
}

export default DataGridFooter;

import { RowData } from "@tanstack/react-table";
import clsx from "clsx";

import styles from "./DataGridFooter.module.css";

import type { DataGridInstance, PaginationPageInfo } from "../types";
import GridPagination from "../components/GridPagination";

export interface DataGridFooterProps<TData extends RowData> {
  instance: DataGridInstance<TData>;
}

const DataGridFooter = <TData extends RowData>({
  instance,
}: DataGridFooterProps<TData>) => {
  const selectedRowModel = instance.getSelectedRowModel();

  const prePagination = instance.getPrePaginationRowModel();
  const pagination = instance.getState().pagination;
  const pageCount = instance.getPageCount();

  const paginationPageInfo: PaginationPageInfo = {
    from: Math.min(pagination.pageIndex * pagination.pageSize + 1, instance.options.rowCount ?? prePagination.rows.length),
    to: Math.min((pagination.pageIndex + 1) * pagination.pageSize, instance.options.rowCount ?? prePagination.rows.length),
    count: instance.options.rowCount ?? prePagination.rows.length,
    page: pagination.pageIndex + 1,
    pageCount,
  };

  return (
    <div 
      className={clsx("DataGridFooter-root", styles.root, instance.options.classNames?.footer?.root)}
      style={instance.options.styles?.footer?.root}
    >
      {selectedRowModel.rows.length > 0 ? (
        <div 
          className={clsx("DataGridFooter-rowSelection", styles.rowSelection, instance.options.classNames?.footer?.rowSelection)}
          style={instance.options.styles?.footer?.rowSelection}
        >
          {instance.options.slots?.selectedRowCount? (
            <instance.options.slots.selectedRowCount instance={instance} selectedRowCount={selectedRowModel.rows.length} {...instance.options.slotProps?.selectedRowCount} />
          ) : (
            <span>
              {instance.localization.footerSelectedRowCount(selectedRowModel.rows.length)}
            </span>
          )}
        </div>
      ) : null}

      {instance.options.enablePagination ? (
        <div
          className={clsx("DataGridFooter-pagination", styles.pagination, instance.options.classNames?.footer?.pagination)}
          style={instance.options.styles?.footer?.pagination}
        >
          {instance.options.slots?.pagination 
          ? <instance.options.slots.pagination instance={instance} pagination={pagination} pageInfo={paginationPageInfo} {...instance.options.slotProps?.pagination} /> 
          : <GridPagination instance={instance as any} pagination={pagination} pageInfo={paginationPageInfo} {...instance.options.slotProps?.pagination} />}
        </div>
      ) : null}
    </div>
  )
}

export default DataGridFooter;

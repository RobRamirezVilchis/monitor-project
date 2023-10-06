import { RowData } from "@tanstack/react-table";
import { ActionIcon, Select, Tooltip } from "@mantine/core";
import clsx from "clsx";

import buttonStyles from "./BaseButton.module.css";

import { DataGridInstance } from "../types";

import { 
  IconChevronLeft,
  IconChevronsLeft, 
  IconChevronRight,
  IconChevronsRight,
} from "@tabler/icons-react";
import { useMemo } from "react";

export interface GridPaginationProps<TData extends RowData> {
  instance: DataGridInstance<TData>;
  rowsPerPageOptions?: number[];
}

const GridPagination = <TData extends RowData>({
  instance,
  rowsPerPageOptions = [10, 25, 50, 100],
}: GridPaginationProps<TData>) => {
  const prePagination = instance.getPrePaginationRowModel();
  const pagination = instance.getState().pagination;
  const pageCount = instance.getPageCount();

  const rppOptions = useMemo(
    () => rowsPerPageOptions.map(x => x.toString()), 
    [rowsPerPageOptions]
  );

  return (
    <div className="flex gap-4 items-center">
      <div className="flex gap-2 items-center">
        <span>{instance.localization.paginationLabelRowsPerPage}</span>
        <span className="w-20">
          <Select
            {...instance.options.slotProps?.baseSelectProps}
            data={rppOptions}
            value={pagination.pageSize.toString()}
            onChange={(value) => {
              value !== null && instance.setPageSize(Number(value));
              instance.options.slotProps?.baseSelectProps?.onChange?.(value);
            }}
          />
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Tooltip label={instance.localization.paginationFirstPage}>
          <ActionIcon
            color="black"
            variant="transparent"
            radius="xl"
            disabled={pagination.pageIndex === 0}
            {...instance.options.slotProps?.baseActionIconProps}
            className={clsx(buttonStyles.root, instance.options?.slotProps?.baseActionIconProps?.className)}
            onClick={e => {
              instance.setPageIndex(0);
              instance.options.slotProps?.baseActionIconProps?.onClick?.(e);
            }}
          >
            <IconChevronsLeft />
          </ActionIcon>
        </Tooltip>

        <Tooltip label={instance.localization.paginationPreviousPage}>
          <ActionIcon
            color="black"
            variant="transparent"
            radius="xl"
            disabled={!instance.getCanPreviousPage()}
            {...instance.options.slotProps?.baseActionIconProps}
            className={clsx(buttonStyles.root, instance.options?.slotProps?.baseActionIconProps?.className)}
            onClick={e => {
              instance.previousPage();
              instance.options.slotProps?.baseActionIconProps?.onClick?.(e);
            }}
          >
            <IconChevronLeft />
          </ActionIcon>
        </Tooltip>

        <span>
          {instance.localization.paginationLabelDisplayRows({
            from: pagination.pageIndex * pagination.pageSize + 1,
            to: (pagination.pageIndex + 1) * pagination.pageSize,
            count: prePagination.rows.length,
            page: pagination.pageIndex + 1,
            pageCount,
          })}
        </span>

        <Tooltip label={instance.localization.paginationNextPage}>
          <ActionIcon
            color="black"
            variant="transparent"
            radius="xl"
            disabled={!instance.getCanNextPage()}
            {...instance.options.slotProps?.baseActionIconProps}
            className={clsx(buttonStyles.root, instance.options?.slotProps?.baseActionIconProps?.className)}
            onClick={e => {
              instance.nextPage();
              instance.options.slotProps?.baseActionIconProps?.onClick?.(e);
            }}
          >
            <IconChevronRight />
          </ActionIcon>
        </Tooltip>

        <Tooltip label={instance.localization.paginationLastPage}>
          <ActionIcon
            color="black"
            variant="transparent"
            radius="xl"
            disabled={pagination.pageIndex === pageCount - 1}
            {...instance.options.slotProps?.baseActionIconProps}
            className={clsx(buttonStyles.root, instance.options?.slotProps?.baseActionIconProps?.className)}
            onClick={e => {
              instance.setPageIndex(pageCount - 1);
              instance.options.slotProps?.baseActionIconProps?.onClick?.(e);
            }}
          >
            <IconChevronsRight />
          </ActionIcon>
        </Tooltip>
      </div>
    </div>
  )
}

export default GridPagination;

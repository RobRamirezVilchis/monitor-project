import { RowData } from "@tanstack/react-table";
import { ActionIcon, Select } from "@mantine/core";

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
        <span>Rows per page</span>
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
        <ActionIcon
          color="black"
          variant="transparent"
          className={buttonStyles.root}
          radius="xl"
          disabled={pagination.pageIndex === 0}
          {...instance.options.slotProps?.baseActionIconProps}
          onClick={e => {
            instance.setPageIndex(0);
            instance.options.slotProps?.baseActionIconProps?.onClick?.(e);
          }}
        >
          <IconChevronsLeft />
        </ActionIcon>

        <ActionIcon
          color="black"
          variant="transparent"
          className={buttonStyles.root}
          radius="xl"
          disabled={!instance.getCanPreviousPage()}
          {...instance.options.slotProps?.baseActionIconProps}
          onClick={e => {
            instance.previousPage();
            instance.options.slotProps?.baseActionIconProps?.onClick?.(e);
          }}
        >
          <IconChevronLeft />
        </ActionIcon>

        <span>
          {pagination.pageIndex * pagination.pageSize + 1} - {
            (pagination.pageIndex + 1) * pagination.pageSize
          } of {prePagination.rows.length}
        </span>

        <ActionIcon
          color="black"
          variant="transparent"
          className={buttonStyles.root}
          radius="xl"
          disabled={!instance.getCanNextPage()}
          {...instance.options.slotProps?.baseActionIconProps}
          onClick={e => {
            instance.nextPage();
            instance.options.slotProps?.baseActionIconProps?.onClick?.(e);
          }}
        >
          <IconChevronRight />
        </ActionIcon>

        <ActionIcon
          color="black"
          variant="transparent"
          className={buttonStyles.root}
          radius="xl"
          disabled={pagination.pageIndex === pageCount - 1}
          {...instance.options.slotProps?.baseActionIconProps}
          onClick={e => {
            instance.setPageIndex(pageCount - 1);
            instance.options.slotProps?.baseActionIconProps?.onClick?.(e);
          }}
        >
          <IconChevronsRight />
        </ActionIcon>
      </div>
    </div>
  )
}

export default GridPagination;

import { RowData } from "@tanstack/react-table";
import { ActionIcon, Select } from "@mantine/core";

import { DataGridInstance } from "../types";

import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { IconChevronsLeft, IconChevronsRight } from "@tabler/icons-react";
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
            data={rppOptions}
            value={pagination.pageSize.toString()}
            onChange={(value) => {
              value !== null && instance.setPageSize(Number(value));
            }}
          />
        </span>
      </div>

      <div className="flex items-center gap-1">
        <ActionIcon
          variant="transparent"
          radius="xl"
          color="gray"
          onClick={() => instance.setPageIndex(0)}
          disabled={pagination.pageIndex === 0}
        >
          <IconChevronsLeft />
        </ActionIcon>

        <ActionIcon
          variant="transparent"
          radius="xl"
          color="gray"
          onClick={() => instance.previousPage()}
          disabled={!instance.getCanPreviousPage()}
        >
          <ChevronLeft />
        </ActionIcon>

        <span>
          {pagination.pageIndex * pagination.pageSize + 1} - {
            (pagination.pageIndex + 1) * pagination.pageSize
          } of {prePagination.rows.length}
        </span>

        <ActionIcon
          variant="transparent"
          radius="xl"
          color="gray"
          onClick={() => instance.nextPage()}
          disabled={!instance.getCanNextPage()}
        >
          <ChevronRight />
        </ActionIcon>

        <ActionIcon
          variant="transparent"
          radius="xl"
          color="gray"
          onClick={() => instance.setPageIndex(pageCount - 1)}
          disabled={pagination.pageIndex === pageCount - 1}
        >
          <IconChevronsRight />
        </ActionIcon>
      </div>
    </div>
  )
}

export default GridPagination;

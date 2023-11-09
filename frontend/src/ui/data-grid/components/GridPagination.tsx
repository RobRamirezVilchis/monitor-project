import { RowData } from "@tanstack/react-table";
import { useMemo } from "react";

import { DataGridInstance } from "../types";
import { getSlotOrNull } from "../utils/slots";
import { getInputValue } from "../utils/getInputValue";

export interface GridPaginationProps<TData extends RowData> {
  instance: DataGridInstance<TData>;
}

const GridPagination = <TData extends RowData>({
  instance,
}: GridPaginationProps<TData>) => {
  const prePagination = instance.getPrePaginationRowModel();
  const pagination = instance.getState().pagination;
  const pageCount = instance.getPageCount();

  const Tooltip =  getSlotOrNull(instance.options.slots?.baseTooltip);
  const IconButton = getSlotOrNull(instance.options.slots?.baseIconButton);
  const Select = getSlotOrNull(instance.options.slots?.baseSelect);
  
  const FirstPageIcon    = getSlotOrNull(instance.options.slots?.firstPageIcon);
  const PreviousPageIcon = getSlotOrNull(instance.options.slots?.previousPageIcon);
  const NextPageIcon     = getSlotOrNull(instance.options.slots?.nextPageIcon);
  const LastPageIcon     = getSlotOrNull(instance.options.slots?.lastPageIcon);

  const rppOptions = useMemo(
    () => instance.options.pageSizeOptions.map(x => x.toString()), 
    [instance.options.pageSizeOptions]
  );

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <div className="flex gap-2 items-center">
        <span>{instance.localization.paginationLabelRowsPerPage}</span>
        <span className="w-20">
          <Select
            {...instance.options.slotProps?.baseSelect}
            data={rppOptions}
            value={pagination.pageSize.toString()}
            onChange={(valueOrEvent, ...args) => {
              const value = getInputValue<string>(valueOrEvent);
              value !== null && instance.setPageSize(Number(value));
              instance.options.slotProps?.baseSelect?.onChange?.(valueOrEvent, ...args);
            }}
          />
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Tooltip label={instance.localization.paginationFirstPage}>
          <IconButton
            disabled={pagination.pageIndex === 0}
            {...instance.options.slotProps?.baseIconButton}
            onClick={(...args) => {
              instance.setPageIndex(0);
              instance.options.slotProps?.baseIconButton?.onClick?.(...args);
            }}
          >
            <FirstPageIcon {...instance.options.slotProps?.firstPageIcon}/>
          </IconButton>
        </Tooltip>

        <Tooltip label={instance.localization.paginationPreviousPage}>
          <IconButton
            disabled={!instance.getCanPreviousPage()}
            {...instance.options.slotProps?.baseIconButton}
            onClick={(...args) => {
              instance.previousPage();
              instance.options.slotProps?.baseIconButton?.onClick?.(...args);
            }}
          >
            <PreviousPageIcon {...instance.options.slotProps?.previousPageIcon} />
          </IconButton>
        </Tooltip>

        <span>
          {instance.localization.paginationLabelDisplayRows({
            from: pagination.pageIndex * pagination.pageSize + 1,
            to: Math.min((pagination.pageIndex + 1) * pagination.pageSize, instance.options.rowCount ?? prePagination.rows.length),
            count: instance.options.rowCount ?? prePagination.rows.length,
            page: pagination.pageIndex + 1,
            pageCount,
          })}
        </span>

        <Tooltip label={instance.localization.paginationNextPage}>
          <IconButton
            disabled={!instance.getCanNextPage()}
            {...instance.options.slotProps?.baseIconButton}
            onClick={(...args) => {
              instance.nextPage();
              instance.options.slotProps?.baseIconButton?.onClick?.(...args);
            }}
          >
            <NextPageIcon {...instance.options.slotProps?.nextPageIcon} />
          </IconButton>
        </Tooltip>

        <Tooltip label={instance.localization.paginationLastPage}>
          <IconButton
            disabled={pagination.pageIndex === pageCount - 1}
            {...instance.options.slotProps?.baseIconButton}
            onClick={(...args) => {
              instance.setPageIndex(pageCount - 1);
              instance.options.slotProps?.baseIconButton?.onClick?.(...args);
            }}
          >
            <LastPageIcon {...instance.options.slotProps?.lastPageIcon} />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  )
}

export default GridPagination;

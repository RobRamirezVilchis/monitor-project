import { RowData } from "@tanstack/react-table";
import { Checkbox } from "@mantine/core";

import { ColumnDef } from "./types";

import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";

export const ROW_SELECTION_COLUMN_ID = "__row_selection__";
export const EXPANDABLE_COLUMN_ID = "__expandable__";
export const ROW_NUMBER_COLUMN_ID = "__row_number__";

export function createRowSelectionColumnDef<TData extends RowData>(): ColumnDef<TData> {
  return {
    id: ROW_SELECTION_COLUMN_ID,
    minSize: 40,
    maxSize: 40,
    enableColumnFilter: false,
    enableGlobalFilter: false,
    enableResizing: false,
    enableReordering: false,
    enableColumnActions: false,
    enableHiding: false,
    header: (ctx) => (
      <Checkbox 
        checked={ctx.table.getIsAllRowsSelected()}
        indeterminate={ctx.table.getIsSomeRowsSelected()}
        onChange={e => {
          ctx.table.toggleAllRowsSelected();
        }}
      />
    ),
    cell: (ctx) => (
      <Checkbox 
        checked={ctx.row.getIsSelected()}
        onChange={e => {
          ctx.row.toggleSelected();
        }}
      />
    )
  };
}

export function createExpandableColumnDef<TData extends RowData>(): ColumnDef<TData> {
  return  {
    id: EXPANDABLE_COLUMN_ID,
    minSize: 40,
    maxSize: 40,
    enableColumnFilter: false,
    enableGlobalFilter: false,
    enableResizing: false,
    enableReordering: false,
    enableColumnActions: false,
    enableHiding: false,
    header: (ctx) => (
      <button className="flex justify-center items-center"
        onClick={ctx.table.getToggleAllRowsExpandedHandler()}
      >
        {ctx.table.getIsSomeRowsExpanded() ? (
          <IconChevronUp />
        ) : (
          <IconChevronDown />
        )}
      </button>
    ),
    cell: (cell) => (
      <button className="flex justify-center items-center"
        onClick={e => {
          const expanded = cell.row.getIsExpanded();
          cell.table.toggleAllRowsExpanded(false);
          if (!expanded)
            cell.row.toggleExpanded();
        }}
      >
        {cell.row.getIsExpanded() ? (
          <IconChevronUp />
        ) : (
          <IconChevronDown />
        )}
      </button>
    ),
  };
}

export function createRowNumberingColumnDef<TData extends RowData>(): ColumnDef<TData> {
  return {
    id: ROW_NUMBER_COLUMN_ID,
    minSize: 50,
    maxSize: 50,
    enableColumnFilter: false,
    enableGlobalFilter: false,
    enableResizing: false,
    enableReordering: false,
    enableColumnActions: false,
    enableHiding: false,
    enableSorting: false,
    header: "#",
    //? Note: Rendering done in the DataGridRowCell component
  };
}
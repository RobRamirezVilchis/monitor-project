import { RowData } from "@tanstack/react-table";
import { ActionIcon, Checkbox, Tooltip } from "@mantine/core";

import buttonStyles from "./components/BaseButton.module.css";

import { ColumnDef, DataGridOptions } from "./types";

import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";

export const ROW_SELECTION_COLUMN_ID = "__row_selection__";
export const EXPANDABLE_COLUMN_ID = "__expandable__";
export const ROW_NUMBER_COLUMN_ID = "__row_number__";

export function createRowSelectionColumnDef<TData extends RowData>(options?: DataGridOptions<TData>): ColumnDef<TData> {
  return {
    id: ROW_SELECTION_COLUMN_ID,
    hideFromColumnsMenu: true,
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
        {...options?.slotProps?.baseCheckboxProps}
        onChange={e => {
          ctx.table.toggleAllRowsSelected();
          options?.slotProps?.baseCheckboxProps?.onChange?.(e);
        }}
      />
    ),
    cell: (ctx) => (
      <Checkbox 
        checked={ctx.row.getIsSelected()}
        {...options?.slotProps?.baseCheckboxProps}
        onChange={e => {
          ctx.row.toggleSelected();
          options?.slotProps?.baseCheckboxProps?.onChange?.(e);
        }}
      />
    )
  };
}

export function createExpandableColumnDef<TData extends RowData>(options?: DataGridOptions<TData>): ColumnDef<TData> {
  return  {
    id: EXPANDABLE_COLUMN_ID,
    hideFromColumnsMenu: true,
    minSize: 40,
    maxSize: 40,
    enableColumnFilter: false,
    enableGlobalFilter: false,
    enableResizing: false,
    enableReordering: false,
    enableColumnActions: false,
    enableHiding: false,
    headerStyles: {
      label: {
        display: "grid",
        placeItems: "center",
      },
    },
    cellStyles: {
      content: {
        display: "grid",
        placeItems: "center",
      },
    },
    header: (ctx) => {
      const expanded = ctx.table.getIsSomeRowsExpanded();
      
      return (
        <Tooltip 
          label={expanded 
            ? options?.localization?.collapseAllRowsLabel 
            : options?.localization?.expandAllRowsLabel
          }
        >
          <ActionIcon 
            color="black"
            variant="transparent"
            className={buttonStyles.root}
            radius="xl"
            size="sm"
            {...options?.slotProps?.baseActionIconProps}
            onClick={e => {
              ctx.table.toggleAllRowsExpanded();
              options?.slotProps?.baseActionIconProps?.onClick?.(e);
            }}
          >
            {expanded ? (
              <IconChevronUp />
            ) : (
              <IconChevronDown />
            )}
          </ActionIcon>
        </Tooltip>
      );
    },
    cell: (cell) => {
      const expanded = cell.row.getIsExpanded();

      return (
        <Tooltip
          label={expanded 
            ? options?.localization?.collapseRowLabel 
            : options?.localization?.expandRowLabel
          }
        >
          <ActionIcon 
            color="black"
            variant="transparent"
            className={buttonStyles.root}
            radius="xl"
            size="sm"
            {...options?.slotProps?.baseActionIconProps}
            onClick={e => {
              const expanded = cell.row.getIsExpanded();
              cell.table.toggleAllRowsExpanded(false);
              if (!expanded)
                cell.row.toggleExpanded();

              options?.slotProps?.baseActionIconProps?.onClick?.(e);
            }}
          >
            {expanded ? (
              <IconChevronUp />
            ) : (
              <IconChevronDown />
            )}
          </ActionIcon>
        </Tooltip>
      );
    },
  };
}

export function createRowNumberingColumnDef<TData extends RowData>(options?: DataGridOptions<TData>): ColumnDef<TData> {
  return {
    id: ROW_NUMBER_COLUMN_ID,
    hideFromColumnsMenu: true,
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
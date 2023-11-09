import { RowData } from "@tanstack/react-table";

import { ColumnDef, DataGridOptions } from "./types";
import { getSlotOrNull } from "./utils/slots";

export const ROW_SELECTION_COLUMN_ID = "__row_selection__";
export const EXPANDABLE_COLUMN_ID = "__expandable__";
export const ROW_NUMBER_COLUMN_ID = "__row_number__";

export function createRowSelectionColumnDef<TData extends RowData>(options?: DataGridOptions<TData>): ColumnDef<TData> {
  const Checkbox = getSlotOrNull(options?.slots?.baseCheckbox);

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
        {...options?.slotProps?.baseCheckbox}
        checked={ctx.table.getIsAllRowsSelected()}
        indeterminate={ctx.table.getIsSomeRowsSelected()}
        onChange={e => {
          ctx.table.toggleAllRowsSelected();
          options?.slotProps?.baseCheckbox?.onChange?.(e);
        }}
      />
    ),
    cell: (ctx) => (
      <Checkbox 
        {...options?.slotProps?.baseCheckbox}
        checked={ctx.row.getIsSelected()}
        onChange={e => {
          ctx.row.toggleSelected();
          options?.slotProps?.baseCheckbox?.onChange?.(e);
        }}
      />
    )
  };
}

export function createExpandableColumnDef<TData extends RowData>(options?: DataGridOptions<TData>): ColumnDef<TData> {
  const ExpandIcon   = options?.slots?.expandIcon;
  const CollapseIcon = options?.slots?.collapseIcon;

  const Tooltip =  getSlotOrNull(options?.slots?.baseTooltip);
  const IconButton = getSlotOrNull(options?.slots?.baseIconButton);

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
      root: { 
        padding: 0, 
        display: "grid",
        placeItems: "center",
      },
    },
    cellStyles: {
      root: { 
        padding: 0,
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
          <IconButton 
            {...options?.slotProps?.baseIconButton}
            onClick={e => {
              ctx.table.toggleAllRowsExpanded();
              options?.slotProps?.baseIconButton?.onClick?.(e);
            }}
          >
            {expanded ? (
              (CollapseIcon ? <CollapseIcon {...options?.slotProps?.expandIcon} /> : null)
            ) : (
              (ExpandIcon ? <ExpandIcon {...options?.slotProps?.collapseIcon} /> : null)
            )}
          </IconButton>
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
          <IconButton 
            {...options?.slotProps?.baseIconButton}
            onClick={e => {
              // const expanded = cell.row.getIsExpanded();
              // cell.table.toggleAllRowsExpanded(false);
              // if (!expanded)
                cell.row.toggleExpanded();

              options?.slotProps?.baseIconButton?.onClick?.(e);
            }}
          >
            {expanded ? (
              (CollapseIcon ? <CollapseIcon {...options?.slotProps?.expandIcon} /> : null)
            ) : (
              (ExpandIcon ? <ExpandIcon {...options?.slotProps?.collapseIcon} /> : null)
            )}
          </IconButton>
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
import { useDraggable } from "@dnd-kit/core";
import { RowData } from "@tanstack/react-table";

import { DataGridInstance } from "../types";
import { getSlotOrNull } from "../utils/slots";

export interface ColumnDragHandleProps<TData extends RowData> {
  instance: DataGridInstance<TData>;
  draggableCtx: ReturnType<typeof useDraggable>;
}

const ColumnDragHandle = <TData extends RowData>({
  instance,
  draggableCtx,
}: ColumnDragHandleProps<TData>) => {
  const ColumnDragHandleIcon = getSlotOrNull(instance.options.slots?.columnDragHandleIcon);

  const Tooltip =  getSlotOrNull(instance.options.slots?.baseTooltip);
  const IconButton = getSlotOrNull(instance.options.slots?.baseIconButton);

  return (
    <span
      // Stop propagation of touch events to prevent scrolling
      onTouchStart={e => e.stopPropagation()}
      onTouchMove={e => e.stopPropagation()}
      onTouchEnd={e => e.stopPropagation()}
      style={{
        display: "inline-flex",
      }}
    >
      <Tooltip
        {...instance.options.slotProps?.baseTooltip}
        label={instance.localization.columnPanelDragHandleLabel}
      >
        <span
          ref={draggableCtx.setNodeRef}
          style={{
            display: "inline-flex",
          }}
          {...draggableCtx.listeners}
          {...draggableCtx.attributes}
          suppressHydrationWarning
        >
          <IconButton 
            {...instance.options.slotProps?.baseIconButton}
            {...instance.options.slotProps?.columnMenuIconButton}
          >
            {<ColumnDragHandleIcon {...instance.options.slotProps?.columnDragHandleIcon} />}
          </IconButton>
        </span>
      </Tooltip>
    </span>
  )
}

export default ColumnDragHandle;

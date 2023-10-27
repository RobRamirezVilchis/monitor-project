import { ActionIcon, Tooltip } from "@mantine/core"
import { useDraggable } from "@dnd-kit/core";
import { RowData } from "@tanstack/react-table";
import clsx from "clsx";

import buttonStyles from "./BaseButton.module.css";

import { DataGridInstance } from "../types";

import { IconGripHorizontal } from "@tabler/icons-react";

export interface ColumnDragHandleProps<TData extends RowData> {
  instance: DataGridInstance<TData>;
  draggableCtx: ReturnType<typeof useDraggable>;
}

const ColumnDragHandle = <TData extends RowData>({
  instance,
  draggableCtx,
}: ColumnDragHandleProps<TData>) => {
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
        openDelay={250}
        withinPortal
        {...instance.options.slotProps?.baseTooltipProps}
        label={instance.localization.columnPanelDragHandleLabel}
      >
        <ActionIcon 
          color="black"
          size="xs"
          variant="transparent"
          {...instance.options.slotProps?.baseActionIconProps}
          className={clsx(buttonStyles.root, instance.options.slotProps?.baseActionIconProps?.className)}
          ref={draggableCtx.setNodeRef}
          {...draggableCtx.listeners}
          {...draggableCtx.attributes}
          suppressHydrationWarning
        >
          <IconGripHorizontal />
        </ActionIcon>
      </Tooltip>
    </span>
  )
}

export default ColumnDragHandle;

import { ActionIcon } from "@mantine/core"
import { useDraggable } from "@dnd-kit/core";

import { IconGripHorizontal } from "@tabler/icons-react";

export interface ColumnDragHandleProps {
  draggableCtx: ReturnType<typeof useDraggable>;
}

const ColumnDragHandle = ({
  draggableCtx,
}: ColumnDragHandleProps) => {
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
      <ActionIcon 
        size="xs"
        variant="transparent"
        ref={draggableCtx.setNodeRef}
        {...draggableCtx.listeners}
        {...draggableCtx.attributes}
        suppressHydrationWarning
      >
        <IconGripHorizontal />
      </ActionIcon>
    </span>
  )
}

export default ColumnDragHandle;

import { useDraggable, useDroppable } from "@dnd-kit/core";
import clsx from "clsx";

import DragHandleIcon from '@mui/icons-material/DragHandle';

interface DndColumnHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  dndId: string | number;
  disabled?: boolean;
}

const DndColumnHeader = ({ 
  children, style, dndId, className, disabled, ...props
}: DndColumnHeaderProps) => {
  const { isDragging, setNodeRef, transform, attributes, listeners } = useDraggable({
    id: dndId, disabled,
  });

  const { setNodeRef: setDroppableNodeRef } = useDroppable({
    id: dndId,
  });

  return (
    <div
      {...props}
      ref={setDroppableNodeRef}
      className={clsx(className, { "bg-gray-300": isDragging })}
      style={{
        ...style,
        transform: transform 
          ? `translate(${transform.x}px, ${transform.y}px`
          : undefined,
      }}
    >
      {children}

      {!disabled ? (
        <button
          ref={setNodeRef}
          {...listeners}
          {...attributes}
          suppressHydrationWarning
        >
          <DragHandleIcon fontSize="small" />
        </button>
      ) : null}
    </div>
  );
}

export default DndColumnHeader;

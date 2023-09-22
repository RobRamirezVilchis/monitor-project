import { Header, RowData } from "@tanstack/react-table";
import { useDraggable, useDroppable } from "@dnd-kit/core";

import { ReactElement } from "react";

export interface DataGridColumnHeaderCellDndProps<TData extends RowData, TValue> {
  children?: (
    draggableCtx: ReturnType<typeof useDraggable>, 
    droppableCtx: ReturnType<typeof useDroppable>
  ) => ReactElement;
  header: Header<TData, TValue>;
}

const DataGridColumnHeaderCellDnd = <TData extends RowData, TValue>({
  children,
  header,
}: DataGridColumnHeaderCellDndProps<TData, TValue>) => {
  const draggable = useDraggable({
    id: header.id,
    data: header,
  });

  const droppable = useDroppable({
    id: header.id,
  });

  return children?.(draggable, droppable) ?? null;
}

export default DataGridColumnHeaderCellDnd;

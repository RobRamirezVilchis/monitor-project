import { 
  CollisionDetection,
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent ,
  KeyboardSensor,
  MouseSensor,
  pointerWithin, 
  rectIntersection,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useCallback, useRef, useState } from "react";
import clsx from "clsx";

import gridColumnHeadersStyles from "./DataGridColumnHeaders.module.css";

import { useIsomorphicLayoutEffect } from "@/hooks/shared/useIsomorphicLayoutEffect";
import type { DataGridInstance } from "../types";
import DataGridColumnHeaderGroup from "./DataGridColumnHeaderGroup";
import DataGridColumnHeaderCell from "./DataGridColumnHeaderCell";

export interface DataGridColumnHeadersProps<TData extends unknown> {
  instance: DataGridInstance<TData>;
}

const DataGridColumnHeaders = <TData extends unknown>({
  instance,
}: DataGridColumnHeadersProps<TData>) => {
  const [draggedHeader, setDraggedHeader] = useState<any | null>(null);
  const columnOrder = useRef(instance.getAllFlatColumns().map(c => c.id));
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }), 
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }), 
    useSensor(KeyboardSensor),
  );

  const headerGroups = instance.getHeaderGroups();

  useIsomorphicLayoutEffect(() => {
    instance.scrolls.main.horizontal.current?.syncScroll(instance.refs.columnHeader.main);

    return () => {
      instance.scrolls.main.horizontal.current?.desyncScroll(instance.refs.columnHeader.main);
    };
  }, [instance.scrolls.main.horizontal, instance.refs.columnHeader.main]);

  useIsomorphicLayoutEffect(() => {
    if (instance.options.enableColumnsVirtualization) {
      const columnHeaderResizeObserver = new ResizeObserver((entries, observer) => {
        instance.scrolls.virtualizers.columns.current?.measure();
      });
      columnHeaderResizeObserver.observe(instance.refs.columnHeader.main.current!);

      return () => {
        columnHeaderResizeObserver.disconnect();
      }
    }
  }, [instance.options.enableColumnsVirtualization, instance.refs.columnHeader.main, instance.scrolls.virtualizers.columns]);

  const onHeaderDragStart = useCallback((e: DragStartEvent) => {
    setDraggedHeader(e.active.data.current);
  }, []);

  const onHeaderDragEnd = useCallback((e: DragEndEvent) => {
    setDraggedHeader(null);
    const { active, over } = e;
    if (!active || !over || active.id === over.id) {
      return;
    }

    const activeIndex = columnOrder.current.findIndex(id => id === active.id);
    const overIndex = columnOrder.current.findIndex(id => id === over?.id);
    if (activeIndex === -1 || overIndex === -1) {
      return;
    }

    const newColumnOrder = [...columnOrder.current];
    newColumnOrder[activeIndex] = over.id as string;
    newColumnOrder[overIndex] = active.id as string;

    columnOrder.current = newColumnOrder;
    instance.setColumnOrder(newColumnOrder);
  }, [instance]);

  // Viewport
  return (
    <div
      className={clsx("DataGridColumnHeaders-root DataGridColumnHeaders-viewport", gridColumnHeadersStyles.root, instance.options.classNames?.columnHeaders?.root)}
      style={instance.options.styles?.columnHeaders?.root}
      onWheel={instance.scrolls.main.horizontal.current?.onWheel}
      onTouchStart={instance.scrolls.main.horizontal.current?.onTouchStart}
      onTouchMove={instance.scrolls.main.horizontal.current?.onTouchMove}
      onTouchEnd={instance.scrolls.main.horizontal.current?.onTouchEnd}
    >
      {/* Columns */}
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionAlgorithm}
        onDragStart={onHeaderDragStart}
        onDragEnd={onHeaderDragEnd}
      >
        <div
          ref={instance.refs.columnHeader.main}
          className={clsx("DataGridColumnHeaders-headersContainer", gridColumnHeadersStyles.headersContainer, instance.options.classNames?.columnHeaders?.container)}
          style={{
            ...instance.options.styles?.columnHeaders?.container,
            width: instance.getTotalSize(),
          }}
        >
          {/* Groups */}
          {headerGroups.map(group => (
            <DataGridColumnHeaderGroup 
              key={group.id} 
              instance={instance}
              group={group} 
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {draggedHeader ? (
            <DataGridColumnHeaderCell 
              instance={instance} 
              header={draggedHeader} 
              isOverlay 
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

export default DataGridColumnHeaders;

const collisionDetectionAlgorithm: CollisionDetection = (args) => {
  // First, let's see if there are any collisions with the pointer
  const pointerCollisions = pointerWithin(args);
  
  // Collision detection algorithms return an array of collisions
  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }
  
  // If there are no collisions with the pointer, return rectangle intersections
  return rectIntersection(args);
};
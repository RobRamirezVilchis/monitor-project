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
import { CSSProperties, UIEventHandler, useCallback, useState } from "react";
import clsx from "clsx";

import gridColumnHeadersStyles from "./DataGridColumnHeaders.module.css";

import { useIsomorphicLayoutEffect } from "@/hooks/shared/useIsomorphicLayoutEffect";
import type { DataGridInstance } from "../types";
import DataGridColumnHeaderGroup from "./DataGridColumnHeaderGroup";
import DataGridColumnHeaderCell from "./DataGridColumnHeaderCell";

export interface DataGridColumnHeadersProps<TData extends unknown> {
  instance: DataGridInstance<TData>;
  style?: CSSProperties;
}

const DataGridColumnHeaders = <TData extends unknown>({
  instance,
  style,
}: DataGridColumnHeadersProps<TData>) => {
  const [draggedHeader, setDraggedHeader] = useState<any | null>(null);
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

  useIsomorphicLayoutEffect(() => {
    instance.scrolls.main.horizontal.current?.syncScroll(instance.refs.columnsHeader.main.viewport);

    return () => {
      instance.scrolls.main.horizontal.current?.desyncScroll(instance.refs.columnsHeader.main.viewport);
    };
  }, [instance.scrolls.main.horizontal, instance.refs.columnsHeader.main.viewport]);

  useIsomorphicLayoutEffect(() => {
    if (!instance.options.enableColumnsVirtualization || !instance.refs.columnsHeader.main.content.current) return;
    
    const columnHeaderResizeObserver = new ResizeObserver((entries, observer) => {
      instance.scrolls.virtualizers.columns.current?.measure();
    });
    columnHeaderResizeObserver.observe(instance.refs.columnsHeader.main.content.current);

    return () => {
      columnHeaderResizeObserver.disconnect();
    }
  }, [instance.options.enableColumnsVirtualization, instance.refs.columnsHeader.main.content, instance.scrolls.virtualizers.columns]);

  const onHeaderDragStart = useCallback((e: DragStartEvent) => {
    setDraggedHeader(e.active.data.current);
  }, []);

  const onHeaderDragEnd = useCallback((e: DragEndEvent) => {
    setDraggedHeader(null);
    const { active, over } = e;
    if (!active || !over || active.id === over.id) {
      return;
    }

    const columnOrder = instance.getState().columnOrder;

    const activeIndex = columnOrder.findIndex(col => col === active.id);
    const overIndex = columnOrder.findIndex(col => col === over?.id);
    if (activeIndex === -1 || overIndex === -1) {
      return;
    }

    const newColumnOrder = [...columnOrder];
    newColumnOrder[activeIndex] = over.id as string;
    newColumnOrder[overIndex] = active.id as string;
    instance.setColumnOrder(newColumnOrder);
  }, [instance]);

  const onScroll: UIEventHandler<HTMLDivElement> = (e) => {
    // Update other scrolls when the column headers are scrolled by tabbing trough the filters
    const left = e.currentTarget.scrollLeft;
    instance.scrolls.main.horizontal.current?.scrollRef.current?.scrollTo({
      left,
      behavior: "instant",
    });
  };

  // Viewport
  return (
    <div
      ref={instance.refs.columnsHeader.main.viewport}
      className={clsx("DataGridColumnHeaders-root DataGridColumnHeaders-viewport", gridColumnHeadersStyles.root, instance.options.classNames?.columnHeaders?.root)}
      style={{
        ...instance.options.styles?.columnHeaders?.root,
        ...style,
      }}
      onWheel={instance.scrolls.main.horizontal.current?.onWheel}
      onTouchStart={instance.scrolls.main.horizontal.current?.onTouchStart}
      onTouchMove={instance.scrolls.main.horizontal.current?.onTouchMove}
      onTouchEnd={instance.scrolls.main.horizontal.current?.onTouchEnd}
      onScroll={onScroll}
      role="rowgroup"
    >
      {/* Columns */}
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionAlgorithm}
        onDragStart={onHeaderDragStart}
        onDragEnd={onHeaderDragEnd}
      >
        <div
          ref={instance.refs.columnsHeader.main.content}
          className={clsx("DataGridColumnHeaders-headersContainer", gridColumnHeadersStyles.headersContainer, instance.options.classNames?.columnHeaders?.container)}
          style={{
            ...instance.options.styles?.columnHeaders?.container,
            width: instance.getTotalSize(),
          }}
        >
          {/* Groups */}
          {instance.getHeaderGroups().map(group => (
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
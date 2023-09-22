import { Header, RowData, flexRender } from "@tanstack/react-table";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import clsx from "clsx";

import gridHeaderCellStyles from "./DataGridColumnHeaderCell.module.css";

import { useDataGridContext } from "../providers/DataGridContext";
import ColumnSortingToggle from "../components/ColumnSortingToggle";
import ColumnMenu from "../components/ColumnMenu";
import ResizeHandler from "./ResizeHandler";

import { IconGripHorizontal } from "@tabler/icons-react";
import { ActionIcon } from "@mantine/core";

export interface DataGridColumnHeaderCellDndProps<TData extends RowData, TValue> {
  header: Header<TData, TValue>;
}

const DataGridColumnHeaderCellDnd = <TData extends RowData, TValue>({
  header,
}: DataGridColumnHeaderCellDndProps<TData, TValue>) => {
  const { classNames, styles } = useDataGridContext();
  
  const { isDragging, setNodeRef: setDraggableNodeRef, transform, attributes, listeners } = useDraggable({
    id: header.id,
    data: header,
  });

  const { setNodeRef: setDroppableNodeRef } = useDroppable({
    id: header.id,
  });

  return (
    <div
      className={clsx("DataGridColumnHeaderCell-root", gridHeaderCellStyles.root, classNames?.columnHeaderCell?.root)}
      style={{
        ...styles?.columnHeaderCell?.root,
        width: header.getSize(),
      }}

      ref={setDroppableNodeRef}
    >
      {/* Content */}
      {!header.isPlaceholder ? (
        <div
          className={clsx("DataGridColumnHeaderCell-content", gridHeaderCellStyles.content, classNames?.columnHeaderCell?.content)}
          // style={styles?.columnHeaderCell?.content}
          style={{
            ...styles?.columnHeaderCell?.content,
            opacity: isDragging ? 0.5 : 1,
            // transform: transform 
            //   ? `translate(${transform.x}px, ${transform.y}px`
            //   : undefined,
          }}
        >
          {/* <DataGridColumnHeaderCellContent header={header} /> */}
          <div
            className={clsx("DataGridColumnHeaderCell-contentLabel", gridHeaderCellStyles.contentLabel, classNames?.columnHeaderCell?.contentLabel)}
            style={styles?.columnHeaderCell?.content}
          >
            <div
              className={clsx("DataGridColumnHeaderCell-label", gridHeaderCellStyles.label, classNames?.columnHeaderCell?.label)}
              style={styles?.columnHeaderCell?.label}
            >
              {flexRender(header.column.columnDef.header, header.getContext())}
            </div>

            {header.subHeaders.length === 0 ? (
              <div
                className={clsx("DataGridColumnHeaderCell-actions", gridHeaderCellStyles.actions, classNames?.columnHeaderCell?.actions)}
                style={styles?.columnHeaderCell?.actions}
              >
                {header.column.getCanSort() ? <ColumnSortingToggle header={header} /> : null}

                <span
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
                    ref={setDraggableNodeRef}
                    {...listeners}
                    {...attributes}
                    suppressHydrationWarning
                  >
                    <IconGripHorizontal />
                  </ActionIcon>
                </span>

                <ColumnMenu header={header} />
              </div>) 
            : null}
          </div>

          {header.column.getCanFilter() && header.subHeaders.length === 0 ? (
            <div
              className={clsx("DataGridColumnHeaderCell-filter", gridHeaderCellStyles.filter, classNames?.columnHeaderCell?.filter)}
              style={styles?.columnHeaderCell?.filters}
            >
              Filters
            </div>
          ) : null}
        </div>
      ) : null}
      
      {header.column.getCanResize() ? <ResizeHandler header={header} /> : null}
    </div>
  );
}

export default DataGridColumnHeaderCellDnd;

import { ActionIcon, Tooltip } from "@mantine/core";
import clsx from "clsx";

import buttonStyles from "./BaseButton.module.css";

import { DataGridInstance, Header } from "../types";

import { 
  IconArrowsSort,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";

export interface ColumnSortingToggleProps<TData extends unknown, TValue> {
  instance: DataGridInstance<TData>;
  header: Header<TData, TValue>;
}

const sortIcons = {
  asc: <IconSortAscending fontSize="small" />,
  desc: <IconSortDescending fontSize="small" />,
};

const ColumnSortingToggle = <TData extends unknown, TValue>({
  instance,
  header,
}: ColumnSortingToggleProps<TData, TValue>) => {

  const sortedBy = header.column.getIsSorted();
  const nextSortBy = header.column.getNextSortingOrder();

  return (
    <Tooltip
      withinPortal
      openDelay={250}
      {...instance.options.slotProps?.baseTooltipProps}
      label={instance.localization.columnPanelSortByLabel({
        direction: sortedBy,
        nextDirection: nextSortBy,
        column: header.column,
      })}  
    >
      <ActionIcon
        color="black"
        size="xs"
        variant="transparent"
        {...instance.options.slotProps?.baseActionIconProps}
        className={clsx(buttonStyles.root, instance.options.slotProps?.baseActionIconProps?.className)}
        onClick={e => {
          header.column.toggleSorting();
          instance.options.slotProps?.baseActionIconProps?.onClick?.(e);
        }}
      >
        {sortedBy ? (
          sortIcons[sortedBy]
        ) : (
          <IconArrowsSort fontSize="small" />
        )}
      </ActionIcon>
    </Tooltip>
  );
}

export default ColumnSortingToggle;

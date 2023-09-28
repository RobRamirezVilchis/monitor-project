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

  const sorted = header.column.getIsSorted();

  return (
    <Tooltip
      withinPortal
      openDelay={250}
      {...instance.options.slotProps?.baseTooltipProps}
      label={
        sorted === "asc"
          ? "Sorted Ascending"
          : sorted === "desc"
            ? "Sorted Descending"
            : "Not Sorted"
      }   
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
        {sorted ? (
          sortIcons[sorted]
        ) : (
          <IconArrowsSort fontSize="small" />
        )}
      </ActionIcon>
    </Tooltip>
  );
}

export default ColumnSortingToggle;

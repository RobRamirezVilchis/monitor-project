import { ActionIcon, Menu, Tooltip } from "@mantine/core";
import { DataGridInstance, Header } from "../types";
import clsx from "clsx";

import buttonStyles from "./BaseButton.module.css";

import { 
  IconArrowsSort,
  IconDotsVertical,
  IconSortAscending,
  IconSortDescending,
  IconEyeOff,
} from "@tabler/icons-react";

function addToMenuItemList(items: JSX.Element[], list: Array<JSX.Element | JSX.Element[]>) {
  if (list.length > 0)
    list.push(<Menu.Divider key={`divider-${list.length}`} />);

  list.push(items);
}

export interface ColumnMenuProps<TData extends unknown, TValue> {
  instance: DataGridInstance<TData>;
  header: Header<TData, TValue>;
}

const ColumnMenu = <TData extends unknown, TValue>({
  instance,
  header,
}: ColumnMenuProps<TData, TValue>) => {
  const sorted = header.column.getIsSorted();

  const sortMenuItems = [
    <Menu.Item
      key="sort-asc"
      leftSection={<IconSortAscending />}
      disabled={sorted === "asc"}
      {...instance.options.slotProps?.baseMenuItemProps}
      onClick={e => {
        header.column.toggleSorting(false);
        instance.options.slotProps?.baseMenuItemProps?.onClick?.(e);
      }}
    >
      Sort Ascending
    </Menu.Item>,
    <Menu.Item
      key="sort-desc"
      leftSection={<IconSortDescending />}
      disabled={sorted === "desc"}
      {...instance.options.slotProps?.baseMenuItemProps}
      onClick={e => {
        header.column.toggleSorting(true);
        instance.options.slotProps?.baseMenuItemProps?.onClick?.(e);
      }}
    >
      Sort Descending
    </Menu.Item>,
    <Menu.Item
      key="sort-clear"
      leftSection={<IconArrowsSort />}
      disabled={sorted === false || sorted === undefined}
      {...instance.options.slotProps?.baseMenuItemProps}
      onClick={e => {
        header.column.clearSorting();
        instance.options.slotProps?.baseMenuItemProps?.onClick?.(e);
      }}
    >
      Clear Sort
    </Menu.Item>,
  ];

  const visibilityMenuItems = [
    <Menu.Item
      key="hide-column"
      leftSection={<IconEyeOff />}
      {...instance.options.slotProps?.baseMenuItemProps}
      onClick={e => {
        header.column.toggleVisibility();
        instance.options.slotProps?.baseMenuItemProps?.onClick?.(e);
      }}
    >
      Hide Column
    </Menu.Item>,
  ];

  const menuItems: Array<JSX.Element | JSX.Element[]> = [];

  if (header.column.getCanSort())
    addToMenuItemList(sortMenuItems, menuItems);
  if (header.column.getCanHide())
    addToMenuItemList(visibilityMenuItems, menuItems);

  if (header.column.columnDef.columnActionsMenuItems) {
    const userColumnActions = header.column.columnDef.columnActionsMenuItems({
      instance,
      column: header.column, 
    });
    if (userColumnActions)
      addToMenuItemList(userColumnActions, menuItems);
  }

  if (menuItems.length === 0) return null;

  return (
    <Menu>
      <Menu.Target>
        <Tooltip
          withinPortal
          openDelay={250}
          {...instance.options.slotProps?.baseTooltipProps}
          label="Menu"
        >
          <ActionIcon
            color="black"
            size="xs"
            variant="transparent"
            {...instance.options.slotProps?.baseActionIconProps}
            className={clsx(buttonStyles.root, instance.options.slotProps?.baseActionIconProps?.className)}
          >
            <IconDotsVertical />
          </ActionIcon>
        </Tooltip>
      </Menu.Target>

      <Menu.Dropdown>
        {menuItems}
      </Menu.Dropdown>
    </Menu>
  )
}

export default ColumnMenu;

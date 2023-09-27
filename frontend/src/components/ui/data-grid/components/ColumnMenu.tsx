import { ActionIcon, Menu } from "@mantine/core";
import { DataGridInstance, Header } from "../types";

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
      onClick={() => header.column.toggleSorting(false)}
      leftSection={<IconSortAscending />}
      disabled={sorted === "asc"}
    >
      Sort Ascending
    </Menu.Item>,
    <Menu.Item
      key="sort-desc"
      onClick={() => header.column.toggleSorting(true)}
      leftSection={<IconSortDescending />}
      disabled={sorted === "desc"}
    >
      Sort Descending
    </Menu.Item>,
    <Menu.Item
      key="sort-clear"
      onClick={() => header.column.clearSorting()}
      leftSection={<IconArrowsSort />}
      disabled={sorted === false || sorted === undefined}
    >
      Clear Sort
    </Menu.Item>,
  ];

  const visibilityMenuItems = [
    <Menu.Item
      key="hide-column"
      onClick={() => header.column.toggleVisibility()}
      leftSection={<IconEyeOff />}
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
        <ActionIcon
          size="xs"
          variant="transparent"
        >
          <IconDotsVertical />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        {menuItems}
      </Menu.Dropdown>
    </Menu>
  )
}

export default ColumnMenu;

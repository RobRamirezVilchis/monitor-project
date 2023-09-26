import { ActionIcon, Menu } from "@mantine/core";
import { Header } from "@tanstack/react-table";

import { 
  IconArrowsSort,
  IconDotsVertical,
  IconSortAscending,
  IconSortDescending,
  IconEyeOff,
} from "@tabler/icons-react";

export interface ColumnMenuProps<TData extends unknown, TValue> {
  header: Header<TData, TValue>;
}

const ColumnMenu = <TData extends unknown, TValue>({
  header,
}: ColumnMenuProps<TData, TValue>) => {
  const sorted = header.column.getIsSorted();

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
        <Menu.Item 
          onClick={() => header.column.toggleSorting(false)}
          leftSection={<IconSortAscending />}
          disabled={sorted === "asc"}
        >
          Sort Ascending
        </Menu.Item>
        <Menu.Item 
          onClick={() => header.column.toggleSorting(true)}
          leftSection={<IconSortDescending />}
          disabled={sorted === "desc"}
        >
          Sort Descending
        </Menu.Item>
        <Menu.Item 
          onClick={() => header.column.clearSorting()}
          leftSection={<IconArrowsSort />}
          disabled={sorted === false || sorted === undefined}
        >
          Clear Sort
        </Menu.Item>
        
        <Menu.Divider />

        <Menu.Item
          onClick={() => header.column.toggleVisibility()}
          leftSection={<IconEyeOff />}
        >
          Hide Column
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}

export default ColumnMenu;

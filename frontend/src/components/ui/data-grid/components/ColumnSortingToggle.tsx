import { ActionIcon } from "@mantine/core";

import { Header } from "../types";

import { 
  IconArrowsSort,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";

export interface ColumnSortingToggleProps<TData extends unknown, TValue> {
  header: Header<TData, TValue>;
}

const sortIcons = {
  asc: <IconSortAscending fontSize="small" />,
  desc: <IconSortDescending fontSize="small" />,
};

const ColumnSortingToggle = <TData extends unknown, TValue>({
  header,
}: ColumnSortingToggleProps<TData, TValue>) => {

  const sorted = header.column.getIsSorted();

  return (
    <ActionIcon
      size="xs"
      variant="transparent"
      onClick={header.column.getToggleSortingHandler()}
    >
      {sorted ? (
        sortIcons[sorted]
      ) : (
        <IconArrowsSort fontSize="small" />
      )}
    </ActionIcon>
  );
}

export default ColumnSortingToggle;

import { Header } from "@tanstack/react-table";
import { ActionIcon } from "@mantine/core";

import ImportExportIcon from '@mui/icons-material/ImportExport';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

export interface ColumnSortProps<TData extends unknown, TValue> {
  header: Header<TData, TValue>;
}

const sortIcons = {
  asc: <ArrowUpwardIcon fontSize="small" />,
  desc: <ArrowDownwardIcon fontSize="small" />,
};

const ColumnSort = <TData extends unknown, TValue>({
  header,
}: ColumnSortProps<TData, TValue>) => {

  const sorted = header.column.getIsSorted();

  return (
    <ActionIcon
      radius="xl"
      onClick={header.column.getToggleSortingHandler()}
    >
      {sorted === false ? (
        <ImportExportIcon fontSize="small" />
      ) : (
        sortIcons[sorted]
      )}
    </ActionIcon>
  );
}

export default ColumnSort;

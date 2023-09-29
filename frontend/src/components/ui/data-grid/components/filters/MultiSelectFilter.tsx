import { useCallback, useState } from "react";
import { RowData } from "@tanstack/react-table";

import { useDebounce } from "@/hooks/shared";
import { DataGridInstance, Header } from "../../types";
import { MultiSelect } from "@mantine/core";

interface MultiSelectFilterProps<TData extends RowData, TValue> {
  instance: DataGridInstance<TData>;
  header: Header<TData, TValue>;
}

const MultiSelectFilter = <TData extends RowData, TValue>({
  instance,
  header,
}: MultiSelectFilterProps<TData, TValue>) => {
  const columnFilterValue = header.column.getFilterValue() as string[] ?? [];
  const debounce = useDebounce({
    callback: useCallback((searchQuery: string[]) => {
      header.column.setFilterValue(searchQuery);
    }, [header.column]),
    debounceTime: 500,
  });
  const [internalValue, setInternalValue] = useState<string[]>(columnFilterValue);

  return (
    <MultiSelect
      placeholder="Filter..."
      value={internalValue}
      onChange={(value) => {
        setInternalValue(value);
        debounce(value);
      }}
      data={[
        "Fuscia",
        "Blue",
        "Red",
        "Green",
        "Yellow",
        "Purple",
        "Orange",
        "Teal",
        "Maroon",
        "Aquamarine",
        "Mauv",
        "Indigo",
        "Goldenrod",
        "Pink",
      ]}
    />
  );
}

export default MultiSelectFilter;

import { useCallback, useState } from "react";
import { RowData } from "@tanstack/react-table";

import { useDebounce } from "@/hooks/shared";
import { DataGridInstance, Header } from "../../types";
import { TagsInput } from "@mantine/core";

interface MultiAutocompleteFilterProps<TData extends RowData, TValue> {
  instance: DataGridInstance<TData>;
  header: Header<TData, TValue>;
}

const MultiAutocompleteFilter = <TData extends RowData, TValue>({
  instance,
  header,
}: MultiAutocompleteFilterProps<TData, TValue>) => {
  const columnFilterValue = header.column.getFilterValue() as string[] ?? [];
  const debounce = useDebounce({
    callback: useCallback((searchQuery: string[]) => {
      header.column.setFilterValue(searchQuery);
    }, [header.column]),
    debounceTime: 500,
  });
  const [internalValue, setInternalValue] = useState<string[]>(columnFilterValue);

  return (
    <TagsInput
      placeholder={instance.localization.filterByPlaceholder(header.column)}
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

export default MultiAutocompleteFilter;

import { useCallback, useState } from "react";
import { RowData } from "@tanstack/react-table";

import { useDebounce } from "@/hooks/shared";
import { DataGridInstance, Header } from "../../types";
import { Autocomplete } from "@mantine/core";

interface AutocompleteFilterProps<TData extends RowData, TValue> {
  instance: DataGridInstance<TData>;
  header: Header<TData, TValue>;
}

const AutocompleteFilter = <TData extends RowData, TValue>({
  instance,
  header,
}: AutocompleteFilterProps<TData, TValue>) => {
  const columnFilterValue = header.column.getFilterValue() as string ?? "";
  const debounce = useDebounce({
    callback: useCallback((searchQuery: string) => {
      header.column.setFilterValue(searchQuery);
    }, [header.column]),
    debounceTime: 500,
  });
  const [internalValue, setInternalValue] = useState<string>(columnFilterValue);

  return (
    <Autocomplete
      placeholder={header.column.columnDef.filterProps?.placeholder 
        || instance.localization.filterByPlaceholder(header.column)
      }
      value={internalValue}
      onChange={(value) => {
        setInternalValue(value);
        debounce(value);
      }}
      data={header.column.columnDef.filterProps?.options ?? []}
    />
  );
}

export default AutocompleteFilter;

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
    debounceTime: header.column.columnDef.filterProps?.debounceTime ?? 300,
  });
  const [internalValue, setInternalValue] = useState<string>(columnFilterValue);

  return (
    <Autocomplete
      {...instance.options.slotProps?.baseAutocompleteProps}
      placeholder={header.column.columnDef.filterProps?.placeholder 
        || instance.localization.filterByPlaceholder(header.column)
      }
      value={internalValue}
      onChange={(value) => {
        setInternalValue(value);
        debounce(value);
        instance.options.slotProps?.baseAutocompleteProps?.onChange?.(value);
      }}
      data={header.column.columnDef.filterProps?.options ?? []}
    />
  );
}

export default AutocompleteFilter;

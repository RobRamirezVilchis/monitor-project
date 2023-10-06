import { useCallback, useState } from "react";
import { RowData } from "@tanstack/react-table";

import { useDebounce } from "@/hooks/shared";
import { DataGridInstance, Header } from "../../types";
import { TextInput } from "@mantine/core";

interface TextFilterProps<TData extends RowData, TValue> {
  instance: DataGridInstance<TData>;
  header: Header<TData, TValue>;
}

const TextFilter = <TData extends RowData, TValue>({
  instance,
  header,
}: TextFilterProps<TData, TValue>) => {
  const columnFilterValue = header.column.getFilterValue() as string ?? "";
  const debounce = useDebounce({
    callback: useCallback((searchQuery: string) => {
      header.column.setFilterValue(searchQuery);
    }, [header.column]),
    debounceTime: 500,
  });
  const [internalValue, setInternalValue] = useState<string>(columnFilterValue);

  return (
    <TextInput
      {...instance.options.slotProps?.baseTextInputProps}
      placeholder={header.column.columnDef.filterProps?.placeholder 
        || instance.localization.filterByPlaceholder(header.column)
      }
      value={internalValue}
      onChange={(e) => {
        setInternalValue(e.target.value);
        debounce(e.target.value);
        instance.options.slotProps?.baseTextInputProps?.onChange?.(e);
      }}
    />
  );
}

export default TextFilter;

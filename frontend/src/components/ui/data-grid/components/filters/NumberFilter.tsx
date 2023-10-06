import { useCallback, useState } from "react";

import { useDebounce } from "@/hooks/shared";
import { DataGridInstance, Header } from "../../types";
import { NumberInput } from "@mantine/core";

interface NumberFilterProps<TData extends unknown, TValue> {
  instance: DataGridInstance<TData>;
  header: Header<TData, TValue>;
}

const NumberFilter = <TData extends unknown, TValue>({
  instance,
  header,
}: NumberFilterProps<TData, TValue>) => {
  const columnFilterValue = header.column.getFilterValue() as string | number ?? "";
  const debounce = useDebounce({
    callback: useCallback((searchQuery: string | number) => {
      header.column.setFilterValue(searchQuery);
    }, [header.column]),
    debounceTime: 500,
  });
  const [internalValue, setInternalValue] = useState<string | number>(columnFilterValue);

  return (
    <NumberInput
      placeholder={instance.localization.filterByPlaceholder(header.column)}
      value={internalValue}
      onChange={(value) => {
        setInternalValue(value);
        debounce(value);
      }}
    />
  );
}

export default NumberFilter;

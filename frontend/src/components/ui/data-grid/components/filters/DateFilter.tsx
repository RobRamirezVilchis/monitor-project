import { useCallback, useState } from "react";
import { RowData } from "@tanstack/react-table";

import { useDebounce } from "@/hooks/shared";
import { DataGridInstance, Header } from "../../types";
import { DateInput } from "@mantine/dates";

import { IconCalendarEvent } from "@tabler/icons-react";

interface DateFilterProps<TData extends RowData, TValue> {
  instance: DataGridInstance<TData>;
  header: Header<TData, TValue>;
}

const DateFilter = <TData extends RowData, TValue>({
  instance,
  header,
}: DateFilterProps<TData, TValue>) => {
  const columnFilterValue = header.column.getFilterValue() as Date | null ?? null;
  const debounce = useDebounce({
    callback: useCallback((value: Date | null) => {
      header.column.setFilterValue(value);
    }, [header.column]),
    debounceTime: 500,
  });
  const [internalValue, setInternalValue] = useState<Date | null>(columnFilterValue);

  return (
    <DateInput
      placeholder="Filter..."
      value={internalValue}
      leftSection={<IconCalendarEvent />}
      onChange={(value) => {
        setInternalValue(value);
        debounce(value);
      }}
      clearable
    />
  );
}

export default DateFilter;

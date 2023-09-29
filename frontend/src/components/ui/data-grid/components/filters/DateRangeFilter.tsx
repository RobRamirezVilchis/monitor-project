import { useCallback, useState } from "react";
import { RowData } from "@tanstack/react-table";

import { useDebounce } from "@/hooks/shared";
import { DataGridInstance, Header } from "../../types";
import { DateInput } from "@mantine/dates";

import { IconCalendarEvent } from "@tabler/icons-react";

interface DateRangeFilterProps<TData extends RowData, TValue> {
  instance: DataGridInstance<TData>;
  header: Header<TData, TValue>;
}

const DateRangeFilter = <TData extends RowData, TValue>({
  instance,
  header,
}: DateRangeFilterProps<TData, TValue>) => {
  const facetedMinMaxValues = header.column.getFacetedMinMaxValues() as [Date | null, Date | null];
  const min = facetedMinMaxValues?.[0] ?? null;
  const max = facetedMinMaxValues?.[1] ?? null;
  const columnFilterValue = header.column.getFilterValue() as [Date | null, Date | null] ?? [min, max];
  const debounce = useDebounce({
    callback: useCallback((value: Date | null) => {
      header.column.setFilterValue(value);
    }, [header.column]),
    debounceTime: 500,
  });
  const [internalValue, setInternalValue] = useState<[Date | null, Date | null]>(columnFilterValue);

  console.log(facetedMinMaxValues)

  if (true)
    return (
      <DateInput
        multiple
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
  else
    return (
      <div>

      </div>
    );
}

export default DateRangeFilter;

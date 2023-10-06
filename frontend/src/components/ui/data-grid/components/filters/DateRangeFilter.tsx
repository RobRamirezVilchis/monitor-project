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
  const columnFilterValue = header.column.getFilterValue() as [Date | null, Date | null] ?? [null, null];

  return (
    <div
      style={{
        display: "grid",
        gap: "0.25rem",
        alignItems: "center",
        gridTemplateColumns: "1fr 1fr",
      }}
    >
      <DateInput
        placeholder={instance.localization.filterMinPlaceholder}
        value={columnFilterValue[0]}
        leftSection={<IconCalendarEvent />}
        onChange={value => header.column.setFilterValue([value, columnFilterValue[1]])}
        clearable
      />

      <DateInput
        placeholder={instance.localization.filterMaxPlaceholder}
        value={columnFilterValue[1]}
        leftSection={<IconCalendarEvent />}
        onChange={value => header.column.setFilterValue([columnFilterValue[0], value])}
        clearable
      />
    </div>
  );
}

export default DateRangeFilter;

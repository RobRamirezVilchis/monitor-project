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

  return (
    <DateInput
      placeholder={header.column.columnDef.filterProps?.placeholder 
        || instance.localization.filterByPlaceholder(header.column)
      }
      value={columnFilterValue}
      leftSection={<IconCalendarEvent />}
      onChange={value => header.column.setFilterValue(value)}
      clearable
      minDate={header.column.columnDef.filterProps?.min}
      maxDate={header.column.columnDef.filterProps?.max}
    />
  );
}

export default DateFilter;

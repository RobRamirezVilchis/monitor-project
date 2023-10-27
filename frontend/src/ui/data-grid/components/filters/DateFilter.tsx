import { RowData } from "@tanstack/react-table";

import { DataGridInstance, Header } from "../../types";
import { DateInput } from "@mantine/dates";

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
      clearable
      {...instance.options.slotProps?.baseDateInputProps}
        placeholder={header.column.columnDef.filterProps?.placeholder 
        || instance.localization.filterByPlaceholder(header.column)
      }
      value={columnFilterValue}
      onChange={value => {
        header.column.setFilterValue(value);
        instance.options.slotProps?.baseDateInputProps?.onChange?.(value);
      }}
      minDate={header.column.columnDef.filterProps?.min}
      maxDate={header.column.columnDef.filterProps?.max}
    />
  );
}

export default DateFilter;

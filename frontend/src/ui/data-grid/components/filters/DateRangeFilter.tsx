import { RowData } from "@tanstack/react-table";

import { DataGridInstance, Header } from "../../types";
import { DateInput } from "@mantine/dates";

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
        clearable
        {...instance.options.slotProps?.baseDateInputProps}
        placeholder={header.column.columnDef.filterProps?.placeholder 
          || instance.localization.filterMinPlaceholder
        }
        value={columnFilterValue[0]}
        onChange={value => {
          header.column.setFilterValue([value, columnFilterValue[1]]);
          instance.options.slotProps?.baseDateInputProps?.onChange?.(value);
        }}
        minDate={header.column.columnDef.filterProps?.min}
        maxDate={header.column.columnDef.filterProps?.max}
      />

      <DateInput
        clearable
        {...instance.options.slotProps?.baseDateInputProps}
        placeholder={header.column.columnDef.filterProps?.placeholder 
          || instance.localization.filterMaxPlaceholder
        }
        value={columnFilterValue[1]}
        onChange={value => {
          header.column.setFilterValue([columnFilterValue[0], value]);
          instance.options.slotProps?.baseDateInputProps?.onChange?.(value);
        }}
        minDate={header.column.columnDef.filterProps?.min}
        maxDate={header.column.columnDef.filterProps?.max}
      />
    </div>
  );
}

export default DateRangeFilter;

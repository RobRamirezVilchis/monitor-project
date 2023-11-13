import { RowData } from "@tanstack/react-table";

import { DataGridInstance, Header } from "../../types";
import { getSlotOrNull } from "../../utils/slots";
import { getInputValue } from "../../utils/getInputValue";

interface DateRangeFilterProps<TData extends RowData, TValue> {
  instance: DataGridInstance<TData>;
  header: Header<TData, TValue>;
}

const DateRangeFilter = <TData extends RowData, TValue>({
  instance,
  header,
}: DateRangeFilterProps<TData, TValue>) => {
  const columnFilterValue = header.column.getFilterValue() as [Date | null, Date | null] ?? [null, null];

  const DateInput = getSlotOrNull(instance.options.slots?.baseDateInput);

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
        {...instance.options.slotProps?.baseDateInput}
        placeholder={header.column.columnDef.filterProps?.placeholder 
          || instance.localization.filterMinPlaceholder
        }
        value={columnFilterValue[0]}
        onChange={(valueOrEvent, ...args) => {
          const value = getInputValue<Date | null>(valueOrEvent);
          header.column.setFilterValue([value, columnFilterValue[1]]);
          instance.options.slotProps?.baseDateInput?.onChange?.(valueOrEvent, ...args);
        }}
        minDate={header.column.columnDef.filterProps?.min}
        maxDate={header.column.columnDef.filterProps?.max}
      />

      <DateInput
        {...instance.options.slotProps?.baseDateInput}
        placeholder={header.column.columnDef.filterProps?.placeholder 
          || instance.localization.filterMaxPlaceholder
        }
        value={columnFilterValue[1]}
        onChange={(valueOrEvent, ...args) => {
          const value = getInputValue<Date | null>(valueOrEvent);
          header.column.setFilterValue([columnFilterValue[0], value]);
          instance.options.slotProps?.baseDateInput?.onChange?.(valueOrEvent, ...args);
        }}
        minDate={header.column.columnDef.filterProps?.min}
        maxDate={header.column.columnDef.filterProps?.max}
      />
    </div>
  );
}

export default DateRangeFilter;

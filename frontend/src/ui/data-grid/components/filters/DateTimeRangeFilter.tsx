import { RowData } from "@tanstack/react-table";

import { DataGridInstance, Header } from "../../types";
import { getSlotOrNull } from "../../utils/slots";
import { getInputValue } from "../../utils/getInputValue";
import { zeroDateUpTo } from "../../utils/zeroDateUpTo";

interface DateRangeFilterProps<TData extends RowData, TValue> {
  instance: DataGridInstance<TData>;
  header: Header<TData, TValue>;
}

const DateRangeFilter = <TData extends RowData, TValue>({
  instance,
  header,
}: DateRangeFilterProps<TData, TValue>) => {
  const columnFilterValue = header.column.getFilterValue() as [Date | null, Date | null] ?? [null, null];

  const DateTimeInput = getSlotOrNull(instance.options.slots?.baseDateTimeInput);

  return (
    <div
      style={{
        display: "grid",
        gap: "0.25rem",
        alignItems: "center",
        gridTemplateColumns: "1fr 1fr",
      }}
    >
      <DateTimeInput
        {...instance.options.slotProps?.baseDateTimeInput}
        placeholder={header.column.columnDef.filterProps?.placeholder 
          || instance.localization.filterMinPlaceholder
        }
        value={columnFilterValue[0]}
        onChange={(valueOrEvent, ...args) => {
          let value = getInputValue<Date | null>(valueOrEvent);
          const zeroTime = header.column.columnDef.filterProps?.zeroTimeUpTo;
          if (value && zeroTime) value = zeroDateUpTo(value, zeroTime);
          header.column.setFilterValue([value, columnFilterValue[1]]);
          instance.options.slotProps?.baseDateTimeInput?.onChange?.(valueOrEvent, ...args);
        }}
        minDate={header.column.columnDef.filterProps?.min}
        maxDate={header.column.columnDef.filterProps?.max}
      />

      <DateTimeInput
        {...instance.options.slotProps?.baseDateTimeInput}
        placeholder={header.column.columnDef.filterProps?.placeholder 
          || instance.localization.filterMaxPlaceholder
        }
        value={columnFilterValue[1]}
        onChange={(valueOrEvent, ...args) => {
          let value = getInputValue<Date | null>(valueOrEvent);
          const zeroTime = header.column.columnDef.filterProps?.zeroTimeUpTo;
          if (value && zeroTime) value = zeroDateUpTo(value, zeroTime);
          header.column.setFilterValue([columnFilterValue[0], value]);
          instance.options.slotProps?.baseDateTimeInput?.onChange?.(valueOrEvent, ...args);
        }}
        minDate={header.column.columnDef.filterProps?.min}
        maxDate={header.column.columnDef.filterProps?.max}
      />
    </div>
  );
}

export default DateRangeFilter;

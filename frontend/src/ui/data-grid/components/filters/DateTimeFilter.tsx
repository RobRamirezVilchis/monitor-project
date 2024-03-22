import { RowData } from "@tanstack/react-table";

import { DataGridInstance, Header } from "../../types";
import { getSlotOrNull } from "../../utils/slots";
import { getInputValue } from "../../utils/getInputValue";
import { zeroDateUpTo } from "../../utils/zeroDateUpTo";

interface DateFilterProps<TData extends RowData, TValue> {
  instance: DataGridInstance<TData>;
  header: Header<TData, TValue>;
}

const DateFilter = <TData extends RowData, TValue>({
  instance,
  header,
}: DateFilterProps<TData, TValue>) => {
  const columnFilterValue = header.column.getFilterValue() as Date | null ?? null;

  const DateTimeInput = getSlotOrNull(instance.options.slots?.baseDateTimeInput);

  return (
    <DateTimeInput
      {...instance.options.slotProps?.baseDateTimeInput}
      placeholder={header.column.columnDef.filterProps?.placeholder 
        || instance.localization.filterByPlaceholder(header.column)
      }
      value={columnFilterValue}
      onChange={(valueOrEvent, ...args) => {
        let value = getInputValue<Date | null>(valueOrEvent);
        const zeroTime = header.column.columnDef.filterProps?.zeroTimeUpTo;
        if (value && zeroTime) value = zeroDateUpTo(value, zeroTime);
        header.column.setFilterValue(value);
        instance.options.slotProps?.baseDateTimeInput?.onChange?.(valueOrEvent, ...args);
      }}
      minDate={header.column.columnDef.filterProps?.min}
      maxDate={header.column.columnDef.filterProps?.max}
    />
  );
}

export default DateFilter;

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

  const DateInput = getSlotOrNull(instance.options.slots?.baseDateInput);

  return (
    <DateInput
      {...instance.options.slotProps?.baseDateInput}
      placeholder={header.column.columnDef.filterProps?.placeholder 
        || instance.localization.filterByPlaceholder(header.column)
      }
      value={columnFilterValue}
      onChange={(valueOrEvent, ...args) => {
        const value = getInputValue<Date | null>(valueOrEvent);
        value?.setHours(0, 0, 0, 0);
        header.column.setFilterValue(value);
        instance.options.slotProps?.baseDateInput?.onChange?.(valueOrEvent, ...args);
      }}
      minDate={header.column.columnDef.filterProps?.min}
      maxDate={header.column.columnDef.filterProps?.max}
    />
  );
}

export default DateFilter;

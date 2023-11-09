import { RowData } from "@tanstack/react-table";

import { DataGridInstance, Header } from "../../types";
import { getSlotOrNull } from "../../utils/slots";
import { getInputValue } from "../../utils/getInputValue";

interface SelectFilterProps<TData extends RowData, TValue> {
  instance: DataGridInstance<TData>;
  header: Header<TData, TValue>;
}

const SelectFilter = <TData extends RowData, TValue>({
  instance,
  header,
}: SelectFilterProps<TData, TValue>) => {
  const columnFilterValue = header.column.getFilterValue() as string | null ?? "";

  const Select = getSlotOrNull(instance.options.slots?.baseSelect);

  return (
    <Select
      {...instance.options.slotProps?.baseSelect}
      placeholder={header.column.columnDef.filterProps?.placeholder 
        || instance.localization.filterByPlaceholder(header.column)
      }
      value={columnFilterValue}
      onChange={(valueOrEvent, ...args) => {
        const value = getInputValue<string | null | "">(valueOrEvent);
        header.column.setFilterValue(value);
        instance.options.slotProps?.baseSelect?.onChange?.(valueOrEvent, ...args);
      }}
      data={header.column.columnDef.filterProps?.options ?? []}
    />
  );
}

export default SelectFilter;

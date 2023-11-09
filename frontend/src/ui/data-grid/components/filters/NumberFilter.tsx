import { useCallback, useState } from "react";

import { useDebounce } from "@/hooks/shared";
import { DataGridInstance, Header } from "../../types";
import { getSlotOrNull } from "../../utils/slots";
import { getInputValue } from "../../utils/getInputValue";

interface NumberFilterProps<TData extends unknown, TValue> {
  instance: DataGridInstance<TData>;
  header: Header<TData, TValue>;
}

const NumberFilter = <TData extends unknown, TValue>({
  instance,
  header,
}: NumberFilterProps<TData, TValue>) => {
  const columnFilterValue = header.column.getFilterValue() as string | number ?? "";
  const debounce = useDebounce({
    callback: useCallback((searchQuery: string | number) => {
      header.column.setFilterValue(searchQuery);
    }, [header.column]),
    debounceTime: header.column.columnDef.filterProps?.debounceTime ?? 300,
  });
  const [internalValue, setInternalValue] = useState<string | number>(columnFilterValue);

  const NumberInput = getSlotOrNull(instance.options.slots?.baseNumberInput);

  return (
    <NumberInput
      {...instance.options.slotProps?.baseNumberInput}
      placeholder={header.column.columnDef.filterProps?.placeholder 
        || instance.localization.filterByPlaceholder(header.column)
      }
      value={internalValue}
      onChange={(valueOrEvent, ...args) => {
        const value = getInputValue<string | number>(valueOrEvent);
        setInternalValue(value);
        debounce(value);
        instance.options.slotProps?.baseNumberInput?.onChange?.(valueOrEvent, ...args);
      }}
      min={header.column.columnDef.filterProps?.min}
      max={header.column.columnDef.filterProps?.max}
    />
  );
}

export default NumberFilter;

import { useCallback, useState } from "react";
import { RowData } from "@tanstack/react-table";

import { useDebounce } from "@/hooks/shared";
import { DataGridInstance, Header } from "../../types";
import { getSlotOrNull } from "../../utils/slots";
import { getInputValue } from "../../utils/getInputValue";

interface TextFilterProps<TData extends RowData, TValue> {
  instance: DataGridInstance<TData>;
  header: Header<TData, TValue>;
}

const TextFilter = <TData extends RowData, TValue>({
  instance,
  header,
}: TextFilterProps<TData, TValue>) => {
  const columnFilterValue = header.column.getFilterValue() as string ?? "";
  const { debounce } = useDebounce({
    callback: useCallback((searchQuery: string) => {
      header.column.setFilterValue(searchQuery);
    }, [header.column]),
    debounceTime: header.column.columnDef.filterProps?.debounceTime ?? 300,
  });
  const [internalValue, setInternalValue] = useState<string>(columnFilterValue);

  const TextInput = getSlotOrNull(instance.options.slots?.baseTextInput);

  return (
    <TextInput
      {...instance.options.slotProps?.baseTextInput}
      placeholder={header.column.columnDef.filterProps?.placeholder 
        || instance.localization.filterByPlaceholder(header.column)
      }
      value={internalValue}
      onChange={(valueOrEvent, ...args) => {
        const value = getInputValue<string>(valueOrEvent);
        setInternalValue(value);
        debounce(value);
        instance.options.slotProps?.baseTextInput?.onChange?.(valueOrEvent, ...args);
      }}
    />
  );
}

export default TextFilter;

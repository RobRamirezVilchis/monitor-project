import { useCallback, useRef, useState } from "react";
import { RowData } from "@tanstack/react-table";

import { useDebounce } from "@/hooks/shared";
import { DataGridInstance, Header } from "../../types";
import { getInputValue } from "../../utils/getInputValue";
import { getSlotOrNull } from "../../utils/slots";

interface AutocompleteFilterProps<TData extends RowData, TValue> {
  instance: DataGridInstance<TData>;
  header: Header<TData, TValue>;
}

const AutocompleteFilter = <TData extends RowData, TValue>({
  instance,
  header,
}: AutocompleteFilterProps<TData, TValue>) => {
  const ref = useRef<HTMLInputElement>(null);
  const skipDebounce = useRef(false);
  const columnFilterValue = header.column.getFilterValue() as string ?? "";
  const { debounce } = useDebounce({
    callback: useCallback((searchQuery: string) => {
      header.column.setFilterValue(searchQuery);
    }, [header.column]),
    debounceTime: header.column.columnDef.filterProps?.debounceTime ?? 300,
  });
  const [internalValue, setInternalValue] = useState<string>(columnFilterValue);

  const Autocomplete = getSlotOrNull(instance.options.slots?.baseAutocomplete);
  const CloseButton = getSlotOrNull(instance.options.slots?.closeButton);

  return (
    <Autocomplete
      {...instance.options.slotProps?.baseAutocomplete}
      ref={ref}
      placeholder={header.column.columnDef.filterProps?.placeholder 
        || instance.localization.filterByPlaceholder(header.column)
      }
      value={internalValue}
      onChange={(valueOrEvent, ...args) => {
        const value = getInputValue<string>(valueOrEvent);
        setInternalValue(value);
        if (skipDebounce.current) {
          header.column.setFilterValue(value);
          skipDebounce.current = false;
        }
        else {
          debounce(value);
        }
        instance.options.slotProps?.baseAutocomplete?.onChange?.(valueOrEvent, ...args);
      }}
      data={header.column.columnDef.filterProps?.options ?? []}
      rightSection={internalValue ? (
        <CloseButton
          {...instance.options.slotProps?.closeButton}
          onMouseDown={(e: any) => e.preventDefault()}
          tabIndex={-1}
          onClick={() => {
            if (!ref.current) return;
            ref.current.focus();
            skipDebounce.current = true;
            // Set value to empty string and dispatch change event to trigger global filter:
            // https://stackoverflow.com/a/46012210
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set;
            nativeInputValueSetter?.call(ref.current, "");
            ref.current.dispatchEvent(new Event("change", { bubbles: true }));
          }}
        />
      ) : null}
    />
  );
}

export default AutocompleteFilter;

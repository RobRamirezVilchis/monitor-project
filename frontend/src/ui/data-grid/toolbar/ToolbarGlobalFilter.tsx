import { useCallback, useRef } from "react";

import { useDebounce } from "@/hooks/shared";
import type { DataGridInstance } from "../types";

import { getSlotOrNull } from "../utils/slots";
import { getInputValue } from "../utils/getInputValue";

export interface ToolbarGlobalFilterProps<TData extends unknown> {
  instance: DataGridInstance<TData>;
}

const ToolbarGlobalFilter = <TData extends unknown>({
  instance,
}: ToolbarGlobalFilterProps<TData>) => {
  const ref = useRef<HTMLInputElement>(null);
  const skipDebounce = useRef(false);
  const { debounce } = useDebounce({
    callback: useCallback((searchQuery: string) => {
      instance.setGlobalFilter(searchQuery);
    }, [instance]),
    debounceTime: instance.options.globalFilterDebounceTime ?? 300,
  });

  const GlobalSearchIcon = getSlotOrNull(instance.options.slots?.globalSearchIcon);

  const CloseButton = getSlotOrNull(instance.options.slots?.closeButton);
  const TextInput = getSlotOrNull(instance.options.slots?.baseTextInput);

  return (
    <TextInput
      {...instance.options.slotProps?.baseTextInput}
      ref={ref}
      defaultValue={instance.getState().globalFilter}
      placeholder={instance.localization.toolbarGlobalFilterPlaceholder}
      onChange={(valueOrEvent, ...args) => {
        const value = getInputValue<string>(valueOrEvent);
        if (skipDebounce.current) {
          instance.setGlobalFilter(value);
          skipDebounce.current = false;
        }
        else {
          debounce(value);
        }
        instance.options.slotProps?.baseTextInput?.onChange?.(valueOrEvent, ...args);
      }}
      leftSection={<GlobalSearchIcon {...instance.options.slotProps?.globalSearchIcon} />}
      rightSection={instance.getState().globalFilter ? (
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

export default ToolbarGlobalFilter;

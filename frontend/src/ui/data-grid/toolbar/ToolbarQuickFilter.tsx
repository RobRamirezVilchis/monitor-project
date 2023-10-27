import { useCallback, useRef } from "react";
import { ActionIcon, TextInput } from "@mantine/core";

import { useDebounce } from "@/hooks/shared";
import type { DataGridInstance } from "../types";

import { IconSearch, IconX } from "@tabler/icons-react";

export interface ToolbarQuickFilterProps<TData extends unknown> {
  instance: DataGridInstance<TData>;
}

const ToolbarQuickFilter = <TData extends unknown>({
  instance,
}: ToolbarQuickFilterProps<TData>) => {
  const ref = useRef<HTMLInputElement>(null);
  const skipDebounce = useRef(false);
  const debounce = useDebounce({
    callback: useCallback((searchQuery: string) => {
      instance.setGlobalFilter(searchQuery);
    }, [instance]),
    debounceTime: instance.options.globalFilterDebounceTime ?? 300,
  });

  return (
    <TextInput
      {...instance.options.slotProps?.baseTextInputProps}
      ref={ref}
      placeholder={instance.localization.toolbarQuickFilterPlaceholder}
      onChange={e => {
        if (skipDebounce.current) {
          instance.setGlobalFilter(e.target.value);
          skipDebounce.current = false;
        }
        else {
          debounce(e.target.value);
        }
        instance.options.slotProps?.baseTextInputProps?.onChange?.(e);
      }}
      leftSection={<IconSearch size="1.25rem" />}
      rightSection={
        <ActionIcon
          variant="subtle"
          radius="xl"
          color="black"
          size="1.5rem"
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
        >
          <IconX size="1rem" />
        </ActionIcon>
      }
    />
  );
}

export default ToolbarQuickFilter;

import { useCallback } from "react";
import { TextInput } from "@mantine/core";

import { useDebounce } from "@/hooks/shared";
import type { DataGridInstance } from "../types";

import { IconSearch } from "@tabler/icons-react";

export interface ToolbarQuickFilterProps<TData extends unknown> {
  instance: DataGridInstance<TData>;
}

const ToolbarQuickFilter = <TData extends unknown>({
  instance,
}: ToolbarQuickFilterProps<TData>) => {
  const debounce = useDebounce({
    callback: useCallback((searchQuery: string) => {
      instance.setGlobalFilter(searchQuery);
    }, [instance]),
    debounceTime: instance.options.globalFilterDebounceTime ?? 300,
  });

  return (
    <TextInput
      {...instance.options.slotProps?.baseTextInputProps}
      placeholder={instance.localization.toolbarQuickFilterPlaceholder}
      onChange={e => {
        debounce(e.target.value);
        instance.options.slotProps?.baseTextInputProps?.onChange?.(e);
      }}
      leftSection={<IconSearch fontSize="small" />}
    />
  );
}

export default ToolbarQuickFilter;

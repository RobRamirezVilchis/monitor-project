import { useCallback } from "react";
import { TextInput } from "@mantine/core";

import { useDebounce } from "@/hooks/shared";
import type { DataGridInstance } from "../types";

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
    debounceTime: 500,
  });

  return (
    <TextInput
      {...instance.options.slotProps?.baseTextInputProps}
      placeholder={instance.localization.toolbarQuickFilterPlaceholder}
      onChange={e => {
        debounce(e.target.value);
        instance.options.slotProps?.baseTextInputProps?.onChange?.(e);
      }}
    />
  );
}

export default ToolbarQuickFilter;

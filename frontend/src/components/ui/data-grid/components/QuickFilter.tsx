import { useCallback } from "react";
import { TextInput } from "@mantine/core";

import { useDebounce } from "@/hooks/shared";
import type { DataGridInstance } from "../types";

export interface QuickFilterProps<TData extends unknown> {
  instance: DataGridInstance<TData>;
}

const QuickFilter = <TData extends unknown>({
  instance,
}: QuickFilterProps<TData>) => {
  const debounce = useDebounce({
    callback: useCallback((searchQuery: string) => {
      instance.setGlobalFilter(searchQuery);
    }, [instance]),
    debounceTime: 500,
  });

  return (
    <div className="px-2">
      <TextInput
        placeholder="Search..."
        onChange={(e) => debounce(e.target.value)}
      />
    </div>
  );
}

export default QuickFilter;

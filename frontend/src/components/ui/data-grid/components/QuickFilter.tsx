import { useCallback } from "react";
import { Table } from "@tanstack/react-table";

import { useDebounce } from "@/hooks/shared";

export interface QuickFilterProps<TData extends unknown> {
  table: Table<TData>;
}

const QuickFilter = <TData extends unknown>({
  table,
}: QuickFilterProps<TData>) => {
  const debounce = useDebounce({
    callback: useCallback((searchQuery: string) => {
      table.setGlobalFilter(searchQuery);
    }, [table]),
    debounceTime: 500,
  });

  return (
    <div className="px-2">
      <input 
        placeholder="Search..."
        onChange={(e) => debounce(e.target.value)}
        style={{
          borderBottom: "1px solid #ccc",
        }}
      />
    </div>
  );
}

export default QuickFilter;

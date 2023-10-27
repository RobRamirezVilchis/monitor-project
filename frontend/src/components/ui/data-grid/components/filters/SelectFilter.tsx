import { RowData } from "@tanstack/react-table";

import { DataGridInstance, Header } from "../../types";
import { Select } from "@mantine/core";

interface SelectFilterProps<TData extends RowData, TValue> {
  instance: DataGridInstance<TData>;
  header: Header<TData, TValue>;
}

const SelectFilter = <TData extends RowData, TValue>({
  instance,
  header,
}: SelectFilterProps<TData, TValue>) => {
  const columnFilterValue = header.column.getFilterValue() as string | null ?? "";

  return (
    <Select
      {...instance.options.slotProps?.baseSelectProps}
      placeholder={header.column.columnDef.filterProps?.placeholder 
        || instance.localization.filterByPlaceholder(header.column)
      }
      value={columnFilterValue}
      onChange={(value) => {
        header.column.setFilterValue(value);
        instance.options.slotProps?.baseSelectProps?.onChange?.(value);
      }}
      data={header.column.columnDef.filterProps?.options ?? []}
    />
  );
}

export default SelectFilter;

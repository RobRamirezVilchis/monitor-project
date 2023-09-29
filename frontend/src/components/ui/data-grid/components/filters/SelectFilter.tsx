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
      placeholder="Filter..."
      value={columnFilterValue}
      onChange={(value) => {
        header.column.setFilterValue(value);
      }}
      data={[
        { label: "All", value: "" },
        "Male",
        "Female",
        "Non-binary",
      ]}
    />
  );
}

export default SelectFilter;

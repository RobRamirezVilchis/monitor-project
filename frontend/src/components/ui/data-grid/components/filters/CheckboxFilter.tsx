import { useCallback, useState } from "react";
import { RowData } from "@tanstack/react-table";

import { useDebounce } from "@/hooks/shared";
import { DataGridInstance, Header } from "../../types";
import { Checkbox } from "@mantine/core";

interface CheckboxFilterProps<TData extends RowData, TValue> {
  instance: DataGridInstance<TData>;
  header: Header<TData, TValue>;
}

const CheckboxFilter = <TData extends RowData, TValue>({
  instance,
  header,
}: CheckboxFilterProps<TData, TValue>) => {
  const columnFilterValue = header.column.getFilterValue() as boolean | undefined;

  return (
    <Checkbox
      label={instance.localization.filterByCheckboxLabel(columnFilterValue, header.column)}
      indeterminate={columnFilterValue === undefined}
      checked={columnFilterValue ?? false}
      onChange={e => {}}
      onClick={e => {
        const prevValue = columnFilterValue;
        let newValue;
        switch (prevValue) {
          case undefined: newValue = true;      break;
          case true     : newValue = false;     break;
          case false    : newValue = undefined; break;
        }
        header.column.setFilterValue(newValue);
      }}
    />
  );
}

export default CheckboxFilter;

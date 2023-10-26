import { useCallback, useState } from "react";
import { RowData } from "@tanstack/react-table";

import { useDebounce } from "@/hooks/shared";
import { DataGridInstance, Header } from "../../types";
import { NumberInput } from "@mantine/core";

interface RangeFilterProps<TData extends RowData, TValue> {
  header: Header<TData, TValue>;
  instance: DataGridInstance<TData>;
}

const RangeFilter = <TData extends RowData, TValue>({
  instance,
  header,
}: RangeFilterProps<TData, TValue>) => {
  const columnFilterValue = header.column.getFilterValue() as [string | number, string | number];
  const min = columnFilterValue?.[0] ?? "";
  const max = columnFilterValue?.[1] ?? "";
  const debounce = useDebounce({
    callback: useCallback((value: [string | number, string | number]) => {
      header.column.setFilterValue(value);
    }, [header.column]),
    debounceTime: header.column.columnDef.filterProps?.debounceTime ?? 300,
  });

  const [internalValue, setInternalValue] = useState<[string | number, string | number]>([min, max]);

  return (
    <div
      style={{
        display: "grid",
        gap: "0.25rem",
        alignItems: "center",
        gridTemplateColumns: "1fr 1fr",
      }}
    >
      <NumberInput
        {...instance.options.slotProps?.baseNumberInputProps}
        placeholder={header.column.columnDef.filterProps?.placeholder 
          || instance.localization.filterMinPlaceholder
        }
        value={internalValue?.[0] ?? ""} 
        onChange={value => { 
          setInternalValue(p => {
            const newMinMax: [string | number, string | number] = [value, p?.[1]];
            debounce(newMinMax);
            return newMinMax;
          });
          instance.options.slotProps?.baseNumberInputProps?.onChange?.(value);
        }}
        min={header.column.columnDef.filterProps?.min}
        max={header.column.columnDef.filterProps?.max}
      />
      <NumberInput 
        {...instance.options.slotProps?.baseNumberInputProps}
        placeholder={header.column.columnDef.filterProps?.placeholder 
          || instance.localization.filterMaxPlaceholder
        }
        value={internalValue?.[1] ?? ""} 
        onChange={value => { 
          setInternalValue(p => {
            const newMinMax: [string | number, string | number] = [p?.[0], value];
            debounce(newMinMax);
            return newMinMax;
          });
          instance.options.slotProps?.baseNumberInputProps?.onChange?.(value);
        }}
        min={header.column.columnDef.filterProps?.min}
        max={header.column.columnDef.filterProps?.max}
      />
    </div>
  );
}

export default RangeFilter;
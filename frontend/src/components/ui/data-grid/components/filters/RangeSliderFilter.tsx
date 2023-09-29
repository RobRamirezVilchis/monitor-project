import { useCallback, useState } from "react";
import { RowData } from "@tanstack/react-table";

import { useDebounce } from "@/hooks/shared";
import { DataGridInstance, Header } from "../../types";
import { RangeSlider } from "@mantine/core";

interface RangeSliderFilterProps<TData extends RowData, TValue> {
  header: Header<TData, TValue>;
  instance: DataGridInstance<TData>;
}

const RangeSliderFilter = <TData extends RowData, TValue>({
  instance,
  header,
}: RangeSliderFilterProps<TData, TValue>) => {
  const facetedMinMaxValues = header.column.getFacetedMinMaxValues();
  const min = Number(facetedMinMaxValues?.[0] ?? 0);
  const max = Number(facetedMinMaxValues?.[1] ?? 0);
  const columnFilterValue = header.column.getFilterValue() as [number, number] ?? [min, max];
  const debounce = useDebounce({
    callback: useCallback((value: [number, number]) => {
      header.column.setFilterValue(value);
    }, [header.column]),
    debounceTime: 500,
  });

  const [internalValue, setInternalValue] = useState<[number, number]>([columnFilterValue[0], columnFilterValue[1]]);

  return (
    <RangeSlider 
      value={internalValue}
      min={min}
      max={max}
      onChange={(value) => {
        setInternalValue(value);
        debounce(value);
      }}
      
    />
  );
}

export default RangeSliderFilter;

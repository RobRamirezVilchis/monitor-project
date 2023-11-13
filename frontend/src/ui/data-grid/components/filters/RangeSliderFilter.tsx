import { useCallback, useEffect, useRef, useState } from "react";
import { RowData } from "@tanstack/react-table";

import { useDebounce } from "@/hooks/shared";
import { DataGridInstance, Header } from "../../types";
import { getSlotOrNull } from "../../utils/slots";
import { getInputValue } from "../../utils/getInputValue";

interface RangeSliderFilterProps<TData extends RowData, TValue> {
  header: Header<TData, TValue>;
  instance: DataGridInstance<TData>;
}

const RangeSliderFilter = <TData extends RowData, TValue>({
  instance,
  header,
}: RangeSliderFilterProps<TData, TValue>) => {
  const facetedMinMaxValues = header.column.getFacetedMinMaxValues();
  const min = header.column.columnDef.filterProps?.min ?? Number(facetedMinMaxValues?.[0] ?? 0);
  const max = header.column.columnDef.filterProps?.max ?? Number(facetedMinMaxValues?.[1] ?? 100);
  const columnFilterValue = header.column.getFilterValue() as [number, number] ?? [min, max];
  const debounce = useDebounce({
    callback: useCallback((value: [number, number]) => {
      header.column.setFilterValue(value);
    }, [header.column]),
    debounceTime: header.column.columnDef.filterProps?.debounceTime ?? 300,
  });

  const firstRenderRef = useRef(true);
  const [internalValue, setInternalValue] = useState<[number, number]>([columnFilterValue[0], columnFilterValue[1]]);

  useEffect(() => {
    // For range slider we want to filter on first render based on the given 
    // min max values, but we don't want to trigger a filter on every change
    if (firstRenderRef.current) {
      if (header.column.columnDef.filterProps?.min !== undefined || header.column.columnDef.filterProps?.max !== undefined)
        header.column.setFilterValue(internalValue);
      firstRenderRef.current = false;
      return;
    }
  }, [internalValue, header.column]);

  const RangeSlider = getSlotOrNull(instance.options.slots?.baseRangeSlider);

  return (
    <RangeSlider
      {...instance.options.slotProps?.baseRangeSlider}
      value={internalValue}
      min={min}
      max={max}
      step={header.column.columnDef.filterProps?.step}
      onChange={(valueOrEvent, ...args) => {
        const value = getInputValue<[number, number]>(valueOrEvent);
        setInternalValue(value);
        debounce(value);
        instance.options.slotProps?.baseRangeSlider?.onChange?.(valueOrEvent, ...args);
      }}
    />
  );
}

export default RangeSliderFilter;

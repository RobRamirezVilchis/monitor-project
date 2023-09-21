import { Header } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useDebounce } from "@/hooks/shared";
import type { DataGridInstance } from "../types";

export interface ColumnFilterProps<TData extends unknown, TValue> {
  header: Header<TData, TValue>;
  instance: DataGridInstance<TData>;
}

const ColumnFilter = <TData extends unknown, TValue>({
  header, instance,
}: ColumnFilterProps<TData, TValue>) => {
  const [firstValue, setFirstValue] = useState<TValue | undefined>(undefined);
  
  useEffect(() => {
    setFirstValue(instance.getPreFilteredRowModel().flatRows[0].getValue(header.column.id));
  }, [instance, header.column.id]);
  // const firstValue = instance.getPreFilteredRowModel().flatRows[0].getValue(header.column.id);
  // const columnFilterValue = header.column.getFilterValue();
  // const uniqueValues = header.column.getFacetedUniqueValues();

  // const sortedUniqueValues = useMemo(
  //   () =>
  //     typeof firstValue === 'number'
  //       ? []
  //       : Array.from(uniqueValues.keys()).sort(),
  //   [uniqueValues, firstValue]
  // )

  if (typeof firstValue === "string")
    return (
      <TextFilter header={header} />
    );

  if (typeof firstValue === "number")
    return (
      <NumberFilter header={header} />
    );

  return null;
}

export default ColumnFilter;

interface TextFilterProps<TData extends unknown, TValue> {
  header: Header<TData, TValue>;
}

const TextFilter = <TData extends unknown, TValue>({
  header,
}: TextFilterProps<TData, TValue>) => {
  const columnFilterValue = header.column.getFilterValue() as string ?? "";
  const debounce = useDebounce({
    callback: useCallback((searchQuery: string) => {
      header.column.setFilterValue(searchQuery);
    }, [header.column]),
    debounceTime: 500,
  });
  const [internalValue, setInternalValue] = useState<string>(columnFilterValue);

  return (
    <div 
      style={{
        width: "60px",
        border: "1px solid black",
      }}
    >
      <input 
        placeholder="Value" 
        style={{ width: "100%" }} 
        value={internalValue}
        onChange={(e) => {
          setInternalValue(e.target.value);
          debounce(e.target.value);
        }}
      />
    </div>
  );
}

interface NumberFilterProps<TData extends unknown, TValue> {
  header: Header<TData, TValue>;
}

const NumberFilter = <TData extends unknown, TValue>({
  header,
}: NumberFilterProps<TData, TValue>) => {
  const columnFilterValue = header.column.getFilterValue() as [number, number] ?? [0, 0];
  const facetedMinMaxValues = header.column.getFacetedMinMaxValues();
  const min = Number(facetedMinMaxValues?.[0] ?? "");
  const max = Number(facetedMinMaxValues?.[1]);
  const debounce = useDebounce({
    callback: useCallback((min: number, max: number) => {
      header.column.setFilterValue([min, max]);
    }, [header.column]),
    debounceTime: 500,
  });

  const [internalValue, setInternalValue] = useState<[number, number]>([min, max]);

  return (
    <div
      className="flex flex-col justify-between"
      style={{
        width: "50px",
      }}
    >
      <input placeholder="Min" value={internalValue?.[0] ?? ""} 
        onChange={e => { 
          setInternalValue(p => {
            const newMinMax: [number, number] = [Number(e.target.value), p?.[1]];
            debounce(newMinMax[0], newMinMax[1]);
            return newMinMax;
          }) 
        }} style={{ width: "100%", border: "1px solid black" }} type="number" />
      <input placeholder="Max" value={internalValue?.[1] ?? ""} 
        onChange={e => { 
          setInternalValue(p => {
            const newMinMax: [number, number] = [p?.[0], Number(e.target.value)];
            debounce(newMinMax[0], newMinMax[1]);
            return newMinMax;
          }) 
        }} style={{ width: "100%", border: "1px solid black" }} type="number" />
    </div>
  );
}
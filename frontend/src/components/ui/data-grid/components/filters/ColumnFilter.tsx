import { RowData } from "@tanstack/react-table";

import { DataGridInstance, Header } from "../../types";
import TextFilter from "./TextFilter";
import NumberFilter from "./NumberFilter";
import RangeFilter from "./RangeFilter";
import RangeSliderFilter from "./RangeSliderFilter";
import DateFilter from "./DateFilter";
import DateRangeFilter from "./DateRangeFilter";
import CheckboxFilter from "./CheckboxFilter";
import AutocompleteFilter from "./AutocompleteFilter";
import SelectFilter from "./SelectFilter";
import MultiSelectFilter from "./MultiSelectFilter";
import MultiAutocompleteFilter from "./MultiAutocompleteFilter";

export interface ColumnFilterProps<TData extends RowData, TValue> {
  instance: DataGridInstance<TData>;
  header: Header<TData, TValue>;
}


// TODO: Apply instance....className/style to filter inputs

// TODO: Prevent window scrolling inside fake scrollbars

// TODO: Add support for async options for select, autocomplete, etc.

const ColumnFilter = <TData extends RowData, TValue>({
  instance,
  header,
}: ColumnFilterProps<TData, TValue>) => {
  const variant = header.column.columnDef.filterVariant ?? "text";

  switch (variant) {
    case "text"                : return <TextFilter header={header} instance={instance} />;
    case "multi-autocomplete"  : return <MultiAutocompleteFilter header={header} instance={instance} />;
    case "autocomplete"        : return <AutocompleteFilter header={header} instance={instance} />;
    case "select"              : return <SelectFilter header={header} instance={instance} />;
    case "multi-select"        : return <MultiSelectFilter header={header} instance={instance} />;
    case "number"              : return <NumberFilter header={header} instance={instance} />;
    case "range"               : return <RangeFilter header={header} instance={instance} />;
    case "range-slider"        : return <RangeSliderFilter header={header} instance={instance} />;
    case "date"                : return <DateFilter header={header} instance={instance} />;
    case "date-range"          : return <DateRangeFilter header={header} instance={instance} />;
    case "checkbox"            : return <CheckboxFilter header={header} instance={instance} />;

    default: return null;
  }
}

export default ColumnFilter;

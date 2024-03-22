import { RowData } from "@tanstack/react-table";

import { DataGridInstance, Header } from "../../types";
import { getSlotOrNull } from "../../utils/slots";

interface CheckboxFilterProps<TData extends RowData, TValue> {
  instance: DataGridInstance<TData>;
  header: Header<TData, TValue>;
}

const CheckboxFilter = <TData extends RowData, TValue>({
  instance,
  header,
}: CheckboxFilterProps<TData, TValue>) => {
  const columnFilterValue = header.column.getFilterValue() as boolean | undefined;

  const Checkbox = getSlotOrNull(instance.options.slots?.baseCheckbox);

  return (
    <Checkbox
      {...instance.options.slotProps?.baseCheckbox}
      label={header.column.columnDef.filterProps?.label
        || instance.localization.filterByCheckboxLabel(columnFilterValue, header.column)
      }
      indeterminate={columnFilterValue === undefined}
      checked={columnFilterValue ?? false}
      onChange={(...args) => {
        instance.options.slotProps?.baseCheckbox?.onChange?.(...args);
      }}
      onClick={(...args) => {
        const prevValue = columnFilterValue;
        let newValue;
        switch (prevValue) {
          case undefined: newValue = true;      break;
          case true     : newValue = false;     break;
          case false    : newValue = undefined; break;
        }
        header.column.setFilterValue(newValue);
        instance.options.slotProps?.baseCheckbox?.onClick?.(...args);
      }}
    />
  );
}

export default CheckboxFilter;

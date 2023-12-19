import { Indicator } from "@mantine/core";

import { DataGridInstance } from "../types";
import { RowData } from "@tanstack/react-table";
import { getSlotOrNull } from "../utils/slots";

export interface ToolbarFilterToggleProps<TData extends RowData> {
  instance: DataGridInstance<TData>;
}

const ToolbarFilterToggle = <TData extends RowData>({
  instance,
}: ToolbarFilterToggleProps<TData>) => {
  const FilterOnIcon  = getSlotOrNull(instance.options.slots?.filterOnIcon);
  const FilterOffIcon = getSlotOrNull(instance.options.slots?.filterOffIcon);
  
  const Badge = getSlotOrNull(instance.options.slots?.baseBadge);
  const IconButton = getSlotOrNull(instance.options.slots?.baseIconButton);
  const Tooltip =  getSlotOrNull(instance.options.slots?.baseTooltip);

  const activeFilters = instance.getState().columnFilters.length;

  return (
    <Badge 
      {...instance.options.slotProps?.baseBadge}
      label={activeFilters} 
      disabled={!activeFilters}
    >
      <Tooltip 
        {...instance.options.slotProps?.baseTooltip}
        label={instance.localization.toolbarShowHideFilters}
      >
        <IconButton
          {...instance.options.slotProps?.baseIconButton}
          onClick={(...args) => {
            instance.setColumnFiltersOpen(prev => !prev);
            instance.options.slotProps?.baseIconButton?.onClick?.(...args);
          }}
        >
          {instance.getState().columnFiltersOpen 
          ? <FilterOnIcon  {...instance.options.slotProps?.filterOnIcon}  /> 
          : <FilterOffIcon {...instance.options.slotProps?.filterOffIcon} />}
        </IconButton>
      </Tooltip>
    </Badge>
  );
}

export default ToolbarFilterToggle;

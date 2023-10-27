import { ActionIcon, Tooltip } from "@mantine/core";
import clsx from "clsx";

import buttonStyles from "../components/BaseButton.module.css";

import { DataGridInstance } from "../types";
import { RowData } from "@tanstack/react-table";

import { 
  IconFilter, 
  IconFilterOff 
} from "@tabler/icons-react";

export interface ToolbarFilterToggleProps<TData extends RowData> {
  instance: DataGridInstance<TData>;
}

const ToolbarFilterToggle = <TData extends RowData>({
  instance,
}: ToolbarFilterToggleProps<TData>) => {
  
  return (
    <Tooltip 
      openDelay={250}
      withinPortal 
      {...instance.options.slotProps?.baseTooltipProps}
      label={instance.localization.toolbarShowHideFilters}
    >
      <ActionIcon
        color="black"
        variant="transparent"
        {...instance.options.slotProps?.baseActionIconProps}
        className={clsx(buttonStyles.root, instance.options.slotProps?.baseActionIconProps?.className)}
        onClick={e => {
          instance.setColumnFiltersOpen(prev => !prev);
          instance.options.slotProps?.baseActionIconProps?.onClick?.(e);
        }}
      >
        {instance.getState().columnFiltersOpen ? <IconFilterOff /> : <IconFilter />}
      </ActionIcon>
    </Tooltip>
  );
}

export default ToolbarFilterToggle;

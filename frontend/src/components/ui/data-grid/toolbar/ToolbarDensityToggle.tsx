import { RowData } from "@tanstack/react-table";
import { ActionIcon, Tooltip } from "@mantine/core";
import clsx from "clsx";

import buttonStyles from "../components/BaseButton.module.css";

import { DataGridInstance } from "../types";

import { 
  IconBaselineDensitySmall, 
  IconBaselineDensityMedium, 
  IconBaselineDensityLarge,
} from "@tabler/icons-react";

export interface ToolbarDensityToggleProps<TData extends RowData> {
  instance: DataGridInstance<TData>;
}

const ToolbarDensityToggle = <TData extends RowData>({
  instance,
}: ToolbarDensityToggleProps<TData>) => {
  return (
    <Tooltip 
      withinPortal 
      openDelay={250}
      {...instance.options.slotProps?.baseTooltipProps}
      label={instance.localization.toolbarToggleDensity}
    >
      <ActionIcon
        color="black"
        variant="transparent"
        {...instance.options.slotProps?.baseActionIconProps}
        className={clsx(buttonStyles.root, instance.options.slotProps?.baseActionIconProps?.className)}
        onClick={e => {
          instance.toggleDensity()
          instance.options.slotProps?.baseActionIconProps?.onClick?.(e);
        }}
      >
        {instance.getState().density === "compact" && <IconBaselineDensitySmall />}
        {instance.getState().density === "normal" && <IconBaselineDensityMedium />}
        {instance.getState().density === "comfortable" && <IconBaselineDensityLarge />}
      </ActionIcon>
    </Tooltip>
  )
}

export default ToolbarDensityToggle;

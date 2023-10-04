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
          instance.density.toggle()
          instance.options.slotProps?.baseActionIconProps?.onClick?.(e);
        }}
      >
        {instance.density.value === "compact" && <IconBaselineDensitySmall />}
        {instance.density.value === "normal" && <IconBaselineDensityMedium />}
        {instance.density.value === "comfortable" && <IconBaselineDensityLarge />}
      </ActionIcon>
    </Tooltip>
  )
}

export default ToolbarDensityToggle;

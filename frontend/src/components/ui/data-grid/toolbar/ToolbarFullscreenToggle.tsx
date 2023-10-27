import { RowData } from "@tanstack/react-table";
import { ActionIcon, Tooltip } from "@mantine/core";
import clsx from "clsx";

import buttonStyles from "../components/BaseButton.module.css";

import { DataGridInstance } from "../types";

import { 
  IconMaximize,
  IconMinimize,
} from "@tabler/icons-react";


export interface ToolbarFullscreenToggleProps<TData extends RowData> {
  instance: DataGridInstance<TData>;
}

const ToolbarFullscreenToggle = <TData extends RowData>({
  instance,
}: ToolbarFullscreenToggleProps<TData>) => {
  return (
    <Tooltip 
      openDelay={250}
      withinPortal 
      {...instance.options.slotProps?.baseTooltipProps}
      label={instance.localization.toolbarToggleFullscreen}
    >
      <ActionIcon
        color="black"
        variant="transparent"
        {...instance.options.slotProps?.baseActionIconProps}
        className={clsx(buttonStyles.root, instance.options.slotProps?.baseActionIconProps?.className)}
        onClick={e => {
          instance.setFullscreen(!instance.getState().fullscreen);
          instance.options.slotProps?.baseActionIconProps?.onClick?.(e);
        }}
      >
        {instance.getState().fullscreen ? <IconMinimize /> : <IconMaximize />}
      </ActionIcon>
    </Tooltip>
  );
}

export default ToolbarFullscreenToggle;

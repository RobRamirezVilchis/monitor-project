import { RowData } from "@tanstack/react-table";
import { ActionIcon, Button, Popover, Switch, Tooltip } from "@mantine/core";
import clsx from "clsx";

import buttonStyles from "../BaseButton.module.css";

import type { DataGridInstance } from "../../types";

import { IconColumns } from "@tabler/icons-react";

export interface ToolbarColumnVisibilityToggleProps<TData extends RowData> {
  instance: DataGridInstance<TData>;
}

const ToolbarColumnVisibilityToggle = <TData extends unknown>({
  instance,
}: ToolbarColumnVisibilityToggleProps<TData>) => {

  return (
    <Popover position="bottom-end">
      <Popover.Target>
        <Tooltip 
          openDelay={250}
          withinPortal 
          {...instance.options.slotProps?.baseTooltipProps}
          label={instance.localization.toolbarShowHideColumns}
        >
          <ActionIcon
            color="black"
            variant="transparent"
            {...instance.options.slotProps?.baseActionIconProps}
            className={clsx(buttonStyles.root, instance.options.slotProps?.baseActionIconProps?.className)}
          >
            <IconColumns />
          </ActionIcon>
        </Tooltip>
      </Popover.Target>
      
      <Popover.Dropdown classNames={{ dropdown: "p-2" }}>
        <div>
          <div className="flex flex-col gap-1">
            {instance.getAllLeafColumns().map(column => (
              <Switch 
                {...instance.options.slotProps?.baseSwitchProps}
                key={column.id} 
                label={column.id}
                checked={column.getIsVisible()} 
                onChange={() => column.toggleVisibility()}
                disabled={column.getCanHide() === false}
              />
            ))}
          </div>

          <div className="flex gap-1">
            <Button
              variant="subtle"
              {...instance.options.slotProps?.baseButtonProps}
              onClick={e => {
                instance.toggleAllColumnsVisible(true);
                instance.options.slotProps?.baseButtonProps?.onClick?.(e);
              }}
              disabled={instance.getIsAllColumnsVisible()}
            >
              {instance.localization.toolbarShowAllColumns}
            </Button>

            <Button
              variant="subtle"
              {...instance.options.slotProps?.baseButtonProps}
              onClick={e => {
                instance.toggleAllColumnsVisible(false);
                instance.options.slotProps?.baseButtonProps?.onClick?.(e);
              }}
              disabled={!instance.getIsSomeColumnsVisible()}
            >
              {instance.localization.toolbarHideAllColumns}
            </Button>
          </div>
        </div>
      </Popover.Dropdown>
    </Popover>
  );
}

export default ToolbarColumnVisibilityToggle;

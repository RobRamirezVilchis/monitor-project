import { RowData } from "@tanstack/react-table";
import { ActionIcon, Button, Popover, Switch } from "@mantine/core";

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
        <ActionIcon>
          <IconColumns />
        </ActionIcon>
      </Popover.Target>
      
      <Popover.Dropdown classNames={{ dropdown: "p-2" }}>
        <div>
          <div className="flex flex-col gap-1">
            {instance.getAllLeafColumns().map(column => (
              <Switch 
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
              disabled={instance.getIsAllColumnsVisible()}
              onClick={() => instance.toggleAllColumnsVisible(true)}
            >
              Mostrar todo
            </Button>

            <Button
              variant="subtle"
              disabled={!instance.getIsSomeColumnsVisible()}
              onClick={() => instance.toggleAllColumnsVisible(false)}
            >
              Ocultar todo
            </Button>
          </div>
        </div>
      </Popover.Dropdown>
    </Popover>
  );
}

export default ToolbarColumnVisibilityToggle;

import { ActionIcon, Button, Popover, Switch } from "@mantine/core";

import type { DataGridInstance } from "../types";

import VisibilityIcon from '@mui/icons-material/Visibility';

export interface ColumnVisibilityProps<TData extends unknown> {
  instance: DataGridInstance<TData>;
}

const ColumnVisibility = <TData extends unknown>({
  instance,
}: ColumnVisibilityProps<TData>) => {

  return (
    <Popover position="bottom-end">
      <Popover.Target>
        <ActionIcon variant="outlined" radius="xl">
          <VisibilityIcon fontSize="small" />
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

export default ColumnVisibility;

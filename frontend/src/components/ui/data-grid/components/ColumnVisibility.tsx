import { Table } from "@tanstack/react-table";

import { ActionIcon, Button, Popover, Switch } from "@mantine/core";

import VisibilityIcon from '@mui/icons-material/Visibility';

export interface ColumnVisibilityProps<TData extends unknown> {
  table: Table<TData>;
}

const ColumnVisibility = <TData extends unknown>({
  table,
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
            {table.getAllLeafColumns().map(column => (
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
              disabled={table.getIsAllColumnsVisible()}
              onClick={() => table.toggleAllColumnsVisible(true)}
            >
              Mostrar todo
            </Button>

            <Button
              variant="subtle"
              disabled={!table.getIsSomeColumnsVisible()}
              onClick={() => table.toggleAllColumnsVisible(false)}
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

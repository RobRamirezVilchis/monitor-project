import { RowData } from "@tanstack/react-table";
import { ActionIcon } from "@mantine/core";

import { DataGridInstance } from "../../types";

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
    <ActionIcon
      onClick={() => instance.setFullscreen(prev => !prev)}
    >
      {instance.fullscreen ? <IconMinimize /> : <IconMaximize />}
    </ActionIcon>
  )
}

export default ToolbarFullscreenToggle;

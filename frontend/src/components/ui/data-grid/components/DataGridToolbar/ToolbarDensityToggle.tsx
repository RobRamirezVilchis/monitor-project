import { RowData } from "@tanstack/react-table";
import { ActionIcon } from "@mantine/core";

import { DataGridInstance } from "../../types";

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
    <ActionIcon
      onClick={() => instance.density.toggle()}
    >
      {instance.density.value === "compact" && <IconBaselineDensitySmall />}
      {instance.density.value === "normal" && <IconBaselineDensityMedium />}
      {instance.density.value === "comfortable" && <IconBaselineDensityLarge />}
    </ActionIcon>
  )
}

export default ToolbarDensityToggle;

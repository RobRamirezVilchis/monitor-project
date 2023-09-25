import { RowData } from "@tanstack/react-table";

import { 
  IconBaselineDensitySmall, 
  IconBaselineDensityMedium, 
  IconBaselineDensityLarge,
} from "@tabler/icons-react";
import { DataGridInstance } from "../types";
import { useDataGridDensity } from "../providers/DensityContext";
import { ActionIcon } from "@mantine/core";

export interface DensityToggleProps<TData extends RowData> {
  instance: DataGridInstance<TData>;
}

const DensityToggle = <TData extends RowData>({
  instance,
}: DensityToggleProps<TData>) => {
  const { value, toggleDensity } = useDataGridDensity();

  return (
    <ActionIcon
      radius="xl"
      variant="transparent"
      onClick={toggleDensity}
    >
      {value === "compact" && <IconBaselineDensitySmall onClick={toggleDensity} />}
      {value === "normal" && <IconBaselineDensityMedium onClick={toggleDensity} />}
      {value === "comfortable" && <IconBaselineDensityLarge onClick={toggleDensity} />}
    </ActionIcon>
  )
}

export default DensityToggle;

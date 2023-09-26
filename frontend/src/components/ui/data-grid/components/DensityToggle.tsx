import { RowData } from "@tanstack/react-table";

import { 
  IconBaselineDensitySmall, 
  IconBaselineDensityMedium, 
  IconBaselineDensityLarge,
} from "@tabler/icons-react";
import { DataGridInstance } from "../types";
import { ActionIcon } from "@mantine/core";

export interface DensityToggleProps<TData extends RowData> {
  instance: DataGridInstance<TData>;
}

const DensityToggle = <TData extends RowData>({
  instance,
}: DensityToggleProps<TData>) => {
  return (
    <ActionIcon
      radius="xl"
      variant="transparent"
      onClick={() => instance.density.toggle()}
    >
      {instance.density.value === "compact" && <IconBaselineDensitySmall onClick={() => instance.density.toggle()} />}
      {instance.density.value === "normal" && <IconBaselineDensityMedium onClick={() => instance.density.toggle()} />}
      {instance.density.value === "comfortable" && <IconBaselineDensityLarge onClick={() => instance.density.toggle()} />}
    </ActionIcon>
  )
}

export default DensityToggle;

import { RowData } from "@tanstack/react-table";

import { DataGridInstance } from "../types";
import { getSlotOrNull } from "../utils/slots";

export interface ToolbarDensityToggleProps<TData extends RowData> {
  instance: DataGridInstance<TData>;
}

const ToolbarDensityToggle = <TData extends RowData>({
  instance,
}: ToolbarDensityToggleProps<TData>) => {
  const DensityCompactIcon     = getSlotOrNull(instance.options.slots?.densityCompactIcon);
  const DensityNormalIcon      = getSlotOrNull(instance.options.slots?.densityNormalIcon);
  const DensityComfortableIcon = getSlotOrNull(instance.options.slots?.densityComfortableIcon);

  const Tooltip    = getSlotOrNull(instance.options.slots?.baseTooltip);
  const IconButton = getSlotOrNull(instance.options.slots?.baseIconButton);

  return (
    <Tooltip 
      {...instance.options.slotProps?.baseTooltip}
      label={instance.localization.toolbarToggleDensity}
    >
      <IconButton
        {...instance.options.slotProps?.baseIconButton}
        onClick={(...args) => {
          instance.toggleDensity()
          instance.options.slotProps?.baseIconButton?.onClick?.(...args);
        }}
      >
        {instance.getState().density === "compact"     ? <DensityCompactIcon {...instance.options.slotProps?.densityCompactIcon} /> : null}
        {instance.getState().density === "normal"      ? <DensityNormalIcon {...instance.options.slotProps?.densityNormalIcon} /> : null}
        {instance.getState().density === "comfortable" ? <DensityComfortableIcon {...instance.options.slotProps?.densityComfortableIcon} /> : null}
      </IconButton>
    </Tooltip>
  )
}

export default ToolbarDensityToggle;

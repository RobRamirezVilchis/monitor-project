import { RowData } from "@tanstack/react-table";

import { DataGridInstance } from "../types";
import { getSlotOrNull } from "../utils/slots";

export interface ToolbarFullscreenToggleProps<TData extends RowData> {
  instance: DataGridInstance<TData>;
}

const ToolbarFullscreenToggle = <TData extends RowData>({
  instance,
}: ToolbarFullscreenToggleProps<TData>) => {
  const FullscreenEnterIcon = getSlotOrNull(instance.options.slots?.fullscreenEnterIcon);
  const FullscreenExitIcon  = getSlotOrNull(instance.options.slots?.fullscreenExitIcon);

  const Tooltip    = getSlotOrNull(instance.options.slots?.baseTooltip);
  const IconButton = getSlotOrNull(instance.options.slots?.baseIconButton);

  return (
    <Tooltip 
      {...instance.options.slotProps?.baseTooltip}
      label={instance.localization.toolbarToggleFullscreen}
    >
      <IconButton
        {...instance.options.slotProps?.baseIconButton}
        onClick={(...args) => {
          instance.setFullscreen(!instance.getState().fullscreen);
          instance.options.slotProps?.baseIconButton?.onClick?.(...args);
        }}
      >
        {instance.getState().fullscreen 
        ? <FullscreenExitIcon  {...instance.options.slotProps?.fullscreenExitIcon} />  
        : <FullscreenEnterIcon {...instance.options.slotProps?.fullscreenEnterIcon} />}
      </IconButton>
    </Tooltip>
  );
}

export default ToolbarFullscreenToggle;

import { DataGridInstance, Header } from "../types";
import { getSlotOrNull } from "../utils/slots";

export interface ColumnSortingToggleProps<TData extends unknown, TValue> {
  instance: DataGridInstance<TData>;
  header: Header<TData, TValue>;
}

const ColumnSortingToggle = <TData extends unknown, TValue>({
  instance,
  header,
}: ColumnSortingToggleProps<TData, TValue>) => {
  const sortedBy = header.column.getIsSorted();
  const nextSortBy = header.column.getNextSortingOrder();

  const SortedAscendingIcon  = getSlotOrNull(instance.options.slots?.sortedAscendingIcon);
  const SortedDescendingIcon = getSlotOrNull(instance.options.slots?.sortedDescendingIcon);
  const UnsortedIcon         = getSlotOrNull(instance.options.slots?.unsortedIcon);

  const Tooltip =  getSlotOrNull(instance.options.slots?.baseTooltip);
  const IconButton = getSlotOrNull(instance.options.slots?.baseIconButton);

  const sortIcons = {
    asc: SortedAscendingIcon ? <SortedAscendingIcon {...instance.options.slotProps?.sortedAscendingIcon} /> : null,
    desc: SortedDescendingIcon ? <SortedDescendingIcon {...instance.options.slotProps?.sortedDescendingIcon} /> : null,
  };

  return (
    <Tooltip
      {...instance.options.slotProps?.baseTooltip}
      label={instance.localization.columnPanelSortByLabel({
        direction: sortedBy,
        nextDirection: nextSortBy,
        column: header.column,
      })}  
    >
      <IconButton
        {...instance.options.slotProps?.baseIconButton}
        {...instance.options.slotProps?.columnMenuIconButton}
        onClick={(...args) => {
          header.column.toggleSorting();
          instance.options.slotProps?.baseIconButton?.onClick?.(...args);
        }}
      >
        {sortedBy ? (
          sortIcons[sortedBy]
        ) : (
         <UnsortedIcon {...instance.options.slotProps?.unsortedIcon} />
        )}
      </IconButton>
    </Tooltip>
  );
}

export default ColumnSortingToggle;

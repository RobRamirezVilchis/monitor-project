import { PolymorphicComponentProps } from "@mantine/core/lib/core/factory/create-polymorphic-component";
import type {
  ActionIconProps,
  ButtonProps,
  CheckboxProps,
  SelectProps,
  SwitchProps,
  TextInputProps,
  TooltipProps,
  MultiSelectProps,
  AutocompleteProps,
  NumberInputProps,
  TagsInputProps,
  RangeSliderProps,
  LoadingOverlayProps,
} from "@mantine/core";
import type { DateInputProps } from "@mantine/dates";
import type { TablerIconsProps } from "@tabler/icons-react";

import type { 
  MenuWrapperProps, 
  MenuContentProps, 
  MenuTargetProps, 
  MenuItemProps,
  MenuDividerProps, 
} from "./Menu";
import type { 
  PopoverWrapperProps, 
  PopoverContentProps, 
  PopoverTargetProps, 
} from "./Popover";
import type { NoResultsOverlayProps } from "./NoResultsOverlay";
import type { NoRowsOverlayProps } from "./NoRowsOverlay";

export interface MantineSlotOverrides {
  baseAutocomplete: AutocompleteProps;
  baseMultiAutocomplete: TagsInputProps;
  baseIconButton: PolymorphicComponentProps<"button", ActionIconProps>;
  baseButton: PolymorphicComponentProps<"button", ButtonProps>;
  baseCheckbox: CheckboxProps;
  baseSelect: SelectProps;
  baseMultiSelect: MultiSelectProps;
  baseSwitch: SwitchProps;
  baseTextInput: TextInputProps;
  baseTooltip: TooltipProps;
  baseNumberInput: NumberInputProps;
  baseRangeSlider: RangeSliderProps;
  baseDateInput: DateInputProps;

  baseMenuWrapper: MenuWrapperProps;
  baseMenuContent: MenuContentProps;
  baseMenuTarget: MenuTargetProps;
  baseMenuItem: MenuItemProps;
  baseMenuDivider: MenuDividerProps;

  basePopoverWrapper: PopoverWrapperProps;
  basePopoverContent: PopoverContentProps;
  basePopoverTarget: PopoverTargetProps;

  loadingOverlay: LoadingOverlayProps;
  noResultsOverlay: NoResultsOverlayProps;
  noRowsOverlay: NoRowsOverlayProps;

  sortedAscendingIcon: TablerIconsProps;
  sortedDescendingIcon: TablerIconsProps;
  unsortedIcon: TablerIconsProps;
  sortAscendingIcon: TablerIconsProps;
  sortDescendingIcon: TablerIconsProps;
  clearSortingIcon: TablerIconsProps;
  hideColumnIcon: TablerIconsProps;
  showColumnIcon: TablerIconsProps;
  columnMenuIcon: TablerIconsProps;
  columnDragHandleIcon: TablerIconsProps;
  filterOnIcon: TablerIconsProps;
  filterOffIcon: TablerIconsProps;
  columnsVisibilityIcon: TablerIconsProps;
  densityCompactIcon: TablerIconsProps;
  densityNormalIcon: TablerIconsProps;
  densityComfortableIcon: TablerIconsProps;
  fullscreenEnterIcon: TablerIconsProps;
  fullscreenExitIcon: TablerIconsProps;
  firstPageIcon: TablerIconsProps;
  previousPageIcon: TablerIconsProps;
  nextPageIcon: TablerIconsProps;
  lastPageIcon: TablerIconsProps;
  globalSearchIcon: TablerIconsProps;
  expandIcon: TablerIconsProps;
  collapseIcon: TablerIconsProps;
}

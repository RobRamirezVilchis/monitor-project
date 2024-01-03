import {
  ActionIcon,
  Button,
  Checkbox,
  Indicator,
  Select,
  Switch,
  TextInput,
  Tooltip,
  MultiSelect,
  Autocomplete,
  NumberInput,
  TagsInput,
  RangeSlider,
  LoadingOverlay,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import {
  IconGripHorizontal,
  IconArrowsSort,
  IconDotsVertical,
  IconSortAscending,
  IconSortDescending,
  IconArrowDown,
  IconArrowUp,
  IconEye,
  IconEyeOff,
  IconChevronUp,
  IconChevronDown,
  IconChevronLeft,
  IconChevronsLeft,
  IconChevronRight,
  IconChevronsRight,
  IconColumns,
  IconBaselineDensitySmall,
  IconBaselineDensityMedium,
  IconBaselineDensityLarge,
  IconFilter,
  IconFilterOff,
  IconMaximize,
  IconMinimize,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { RowData } from "@tanstack/react-table";

import type { DataGridInstance, DataGridOptions, SlotOverridesSignature } from "../data-grid/types";
import { MantineSlotOverrides } from "./slots/overrides.types";
import { MenuWrapper, MenuContent, MenuTarget, MenuItem, MenuDivider } from "./slots/Menu";
import { PopoverWrapper, PopoverContent, PopoverTarget } from "./slots/Popover";
import { DateTimeInput } from "./slots/DateTimeInput";
import NoResultsOverlay from "./slots/NoResultsOverlay";
import NoRowsOverlay from "./slots/NoRowsOverlay";
import _useDataGrid from "../data-grid/useDataGrid";

export const useDataGrid = <TData extends RowData, SlotPropsOverrides extends SlotOverridesSignature = {}>({
  slots, slotProps, ...options
}: DataGridOptions<TData, MantineSlotOverrides & SlotPropsOverrides>): DataGridInstance<TData, MantineSlotOverrides & SlotPropsOverrides> => {
  const gridInstance = _useDataGrid<TData, MantineSlotOverrides>({
    ...options,
    slots: {
      baseAutocomplete      : Autocomplete,
      baseBadge             : Indicator,
      baseMultiAutocomplete : TagsInput,
      baseIconButton        : ActionIcon,
      baseButton            : Button,
      baseCheckbox          : Checkbox,
      baseSelect            : Select,
      baseMultiSelect       : MultiSelect,
      baseSwitch            : Switch,
      baseTextInput         : TextInput,
      baseTooltip           : Tooltip,
      baseNumberInput       : NumberInput,
      baseRangeSlider       : RangeSlider,
      baseDateInput         : DateInput,
      baseDateTimeInput     : DateTimeInput,

      baseMenuWrapper       : MenuWrapper,
      baseMenuContent       : MenuContent,
      baseMenuTarget        : MenuTarget,
      baseMenuItem          : MenuItem,
      baseMenuDivider       : MenuDivider,

      basePopoverWrapper    : PopoverWrapper,
      basePopoverTarget     : PopoverTarget,
      basePopoverContent    : PopoverContent,

      loadingOverlay        : LoadingOverlay,
      noResultsOverlay      : NoResultsOverlay,
      noRowsOverlay         : NoRowsOverlay,

      sortedAscendingIcon   : IconArrowUp,
      sortedDescendingIcon  : IconArrowDown,
      unsortedIcon          : IconArrowsSort,
      sortAscendingIcon     : IconSortAscending,
      sortDescendingIcon    : IconSortDescending,
      clearSortingIcon      : IconArrowsSort,
      hideColumnIcon        : IconEyeOff,
      showColumnIcon        : IconEye,
      columnMenuIcon        : IconDotsVertical,
      columnDragHandleIcon  : IconGripHorizontal,
      filterOnIcon          : IconFilter,
      filterOffIcon         : IconFilterOff,
      columnsVisibilityIcon : IconColumns,
      densityCompactIcon    : IconBaselineDensitySmall,
      densityNormalIcon     : IconBaselineDensityMedium,
      densityComfortableIcon: IconBaselineDensityLarge,
      fullscreenEnterIcon   : IconMaximize,
      fullscreenExitIcon    : IconMinimize,
      firstPageIcon         : IconChevronsLeft,
      previousPageIcon      : IconChevronLeft,
      nextPageIcon          : IconChevronRight,
      lastPageIcon          : IconChevronsRight,
      globalSearchIcon      : IconSearch,
      expandIcon            : IconChevronDown,
      collapseIcon          : IconChevronUp,
      clearIcon             : IconX,

      ...slots,
    },
    slotProps: {
      ...slotProps,
      baseBadge: {
        classNames: {
          indicator: "py-2",
          root: "grid place-items-center"
        },
        ...slotProps?.baseBadge,
      },
      baseButton: {
        variant: "subtle",
        ...slotProps?.baseButton,
      },
      baseIconButton: {
        variant: "subtle",
        radius: "xl",
        ...slotProps?.baseIconButton,
      },
      globalSearchIcon: {
        size: "1.25rem",
        ...slotProps?.globalSearchIcon,
      },
      loadingOverlay: {
        visible: true,
        ...slotProps?.loadingOverlay,
      },
      baseTooltip: {
        openDelay: 250,
        withinPortal: true,
        suppressHydrationWarning: true,
        ...slotProps?.baseTooltip,
      },
      columnMenuIconButton: {
        size: "xs",
        ...slotProps?.columnMenuIconButton,
      },
      basePopoverWrapper: {
        position: "bottom-end",
        ...slotProps?.basePopoverWrapper,
      },
      baseDateInput: {
        clearable: true,
        ...slotProps?.baseDateInput,
      },
      baseDateTimeInput: {
        clearable: true,
        withSeconds: true,
        ...slotProps?.baseDateTimeInput,
      },
      clearIcon: {
        size: "1rem",
        ...slotProps?.clearIcon,
      },
    },
  });

  return gridInstance as DataGridInstance<TData, MantineSlotOverrides & SlotPropsOverrides>;
}

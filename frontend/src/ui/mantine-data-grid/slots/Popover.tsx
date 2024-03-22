import { 
  Popover as _Popover,
  type PopoverProps as _PopoverProps,
  type PopoverTargetProps as _PopoverTargetProps,
  type PopoverDropdownProps as _PopoverDropdownProps,
} from "@mantine/core";

import { DataGridSlotBaseProps } from "@/ui/data-grid/types";

export type PopoverWrapperProps = _PopoverProps & DataGridSlotBaseProps<any>["basePopoverWrapper"];

export const PopoverWrapper = ({
  children,
  // We ignore this props as we don't need them
  open,
  setOpen,
  targetRef,
  ...props
}: PopoverWrapperProps) => <_Popover {...props}>{children}</_Popover>;

export type PopoverContentProps = _PopoverDropdownProps & DataGridSlotBaseProps<any>["basePopoverContent"];

export const PopoverContent = ({
  children,
  // We ignore this props as we don't need them
  open,
  setOpen,
  targetRef,
  ...props
}: PopoverContentProps) => <_Popover.Dropdown {...props}>{children}</_Popover.Dropdown>;

export type PopoverTargetProps =_PopoverTargetProps & DataGridSlotBaseProps<any>["basePopoverTarget"];

export const PopoverTarget = _Popover.Target;

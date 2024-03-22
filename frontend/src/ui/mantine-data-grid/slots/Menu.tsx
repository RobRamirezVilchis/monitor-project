import { 
  Menu as _Menu,
  type MenuProps as _MenuProps,
  type MenuTargetProps as _MenuTargetProps,
  type MenuDropdownProps as _MenuDropdownProps,
  type MenuDividerProps as _MenuDividerProps,
  type MenuItemProps as _MenuItemProps,
} from "@mantine/core";
import { PolymorphicComponentProps } from "@mantine/core/lib/core/factory/create-polymorphic-component";

import { DataGridSlotBaseProps } from "@/ui/data-grid/types";

export type MenuWrapperProps = _MenuProps & DataGridSlotBaseProps<any>["baseMenuWrapper"];

export const MenuWrapper = ({
  children,
  // We ignore this props as we don't need them
  open,
  setOpen,
  targetRef,
  ...props
}: MenuWrapperProps) => <_Menu {...props}>{children}</_Menu>;

export type MenuContentProps = _MenuDropdownProps & DataGridSlotBaseProps<any>["baseMenuContent"];

export const MenuContent = ({
  children,
  // We ignore this props as we don't need them
  open,
  setOpen,
  targetRef,
  ...props
}: MenuContentProps) => <_Menu.Dropdown {...props}>{children}</_Menu.Dropdown>;

export type MenuTargetProps =_MenuTargetProps & DataGridSlotBaseProps<any>["baseMenuTarget"];

export const MenuTarget = _Menu.Target;

export type MenuItemProps = PolymorphicComponentProps<"button", _MenuItemProps> & DataGridSlotBaseProps<any>["baseMenuItem"];

export const MenuItem = ({
  children,
  icon,
  ...props
}: MenuItemProps) => <_Menu.Item {...props} leftSection={icon} >{children}</_Menu.Item>;

export type MenuDividerProps = _MenuDividerProps & DataGridSlotBaseProps<any>["baseMenuDivider"];

export const MenuDivider = _Menu.Divider;
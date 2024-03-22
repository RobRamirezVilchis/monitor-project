import { JSXElementConstructor, useRef, useState } from "react";
import { DataGridInstance, Header } from "../types";

import { getSlotOrNull } from "../utils/slots";

function addToMenuItemList(items: JSX.Element[], list: Array<JSX.Element | JSX.Element[]>, MenuDivider: JSXElementConstructor<any>, menuDividerProps?: any) {
  if (list.length > 0)
    list.push(<MenuDivider key={`divider-${list.length}`} {...menuDividerProps} />);

  list.push(items);
}

export interface ColumnMenuProps<TData extends unknown, TValue> {
  instance: DataGridInstance<TData>;
  header: Header<TData, TValue>;
}

const ColumnMenu = <TData extends unknown, TValue>({
  instance,
  header,
}: ColumnMenuProps<TData, TValue>) => {
  const sorted = header.column.getIsSorted();
  const menuTargetRef = useRef<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const SortAscendingIcon  = getSlotOrNull(instance.options.slots?.sortAscendingIcon);
  const SortDescendingIcon = getSlotOrNull(instance.options.slots?.sortDescendingIcon);
  const ClearSortingIcon   = getSlotOrNull(instance.options.slots?.clearSortingIcon);
  const ColumnMenuIcon     = getSlotOrNull(instance.options.slots?.columnMenuIcon);
  const HideColumnIcon     = getSlotOrNull(instance.options.slots?.hideColumnIcon);

  const Tooltip =  getSlotOrNull(instance.options.slots?.baseTooltip);
  const IconButton = getSlotOrNull(instance.options.slots?.baseIconButton);
  const MenuWrapper = getSlotOrNull(instance.options.slots?.baseMenuWrapper);
  const MenuContent = getSlotOrNull(instance.options.slots?.baseMenuContent);
  const MenuTarget = getSlotOrNull(instance.options.slots?.baseMenuTarget);
  const MenuItem = getSlotOrNull(instance.options.slots?.baseMenuItem);
  const MenuDivider = getSlotOrNull(instance.options.slots?.baseMenuDivider);

  const sortMenuItems = [
    <MenuItem
      key="sort-asc"
      icon={<SortAscendingIcon {...instance.options.slotProps?.sortAscendingIcon} />}
      {...instance.options.slotProps?.baseMenuItem}
      disabled={sorted === "asc"}
      onClick={(...args) => {
        header.column.toggleSorting(false);
        instance.options.slotProps?.baseMenuItem?.onClick?.(...args);
      }}
    >
      {instance.localization.columnMenuSortByAscending(header.column)}
    </MenuItem>,
    <MenuItem
      key="sort-desc"
      icon={<SortDescendingIcon {...instance.options.slotProps?.sortDescendingIcon} />}
      {...instance.options.slotProps?.baseMenuItem}
      disabled={sorted === "desc"}
      onClick={(...args) => {
        header.column.toggleSorting(true);
        instance.options.slotProps?.baseMenuItem?.onClick?.(...args);
      }}
    >
      {instance.localization.columnMenuSortByDescending(header.column)}
    </MenuItem>,
    <MenuItem
      key="sort-clear"
      icon={<ClearSortingIcon {...instance.options.slotProps?.clearSortingIcon} />}
      {...instance.options.slotProps?.baseMenuItem}
      disabled={sorted === false || sorted === undefined}
      onClick={(...args) => {
        header.column.clearSorting();
        instance.options.slotProps?.baseMenuItem?.onClick?.(...args);
      }}
    >
      {instance.localization.columnMenuClearSortBy(header.column)}
    </MenuItem>,
  ];

  const visibilityMenuItems = [
    <MenuItem
      key="hide-column"
      icon={<HideColumnIcon {...instance.options.slotProps?.hideColumnIcon} /> }
      {...instance.options.slotProps?.baseMenuItem}
      onClick={(...args) => {
        header.column.toggleVisibility();
        instance.options.slotProps?.baseMenuItem?.onClick?.(...args);
      }}
    >
      {instance.localization.columnMenuHideColumn}
    </MenuItem>,
  ];

  const menuItems: Array<JSX.Element | JSX.Element[]> = [];

  if (header.column.getCanSort())
    addToMenuItemList(sortMenuItems, menuItems, MenuDivider, instance.options.slotProps?.baseMenuDivider);
  if (header.column.getCanHide())
    addToMenuItemList(visibilityMenuItems, menuItems, MenuDivider, instance.options.slotProps?.baseMenuDivider);

  if (header.column.columnDef.columnActionsMenuItems) {
    const userColumnActions = header.column.columnDef.columnActionsMenuItems({
      instance,
      column: header.column, 
    });
    if (userColumnActions)
      addToMenuItemList(userColumnActions, menuItems, MenuDivider, instance.options.slotProps?.baseMenuDivider);
  }

  if (menuItems.length === 0) return null;

  return (
    <MenuWrapper
      {...instance.options.slotProps?.baseMenuWrapper}
      open={menuOpen}
      setOpen={setMenuOpen}
      targetRef={menuTargetRef}
    >
      <MenuTarget
        {...instance.options.slotProps?.baseMenuTarget}
        ref={menuTargetRef}
      >
        <Tooltip
          label={instance.localization.columnPanelMenuLabel}
          {...instance.options.slotProps?.baseTooltip}
        >
          <IconButton
            {...instance.options.slotProps?.baseIconButton}
            {...instance.options.slotProps?.columnMenuIconButton}
          >
            <ColumnMenuIcon {...instance.options.slotProps?.columnMenuIcon} />
          </IconButton>
        </Tooltip>
      </MenuTarget>

      <MenuContent
        {...instance.options.slotProps?.baseMenuContent}
        open={menuOpen}
        setOpen={setMenuOpen}
        targetRef={menuTargetRef}
      >
        {menuItems}
      </MenuContent>
    </MenuWrapper>
  )
}

export default ColumnMenu;

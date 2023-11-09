import { RowData } from "@tanstack/react-table";
import { useRef, useState } from "react";
import clsx from "clsx";

import styles from "./DataGridToolbar.module.css";

import type { DataGridInstance } from "../types";
import { getSlotOrNull } from "../utils/slots";

export interface ToolbarColumnVisibilityToggleProps<TData extends RowData> {
  instance: DataGridInstance<TData>;
}

const ToolbarColumnVisibilityToggle = <TData extends unknown>({
  instance,
}: ToolbarColumnVisibilityToggleProps<TData>) => {
  const popoverTargetRef = useRef<any>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const ColumnsVisibilityIcon = getSlotOrNull(instance.options.slots?.columnsVisibilityIcon);

  const Button         = getSlotOrNull(instance.options.slots?.baseButton);
  const Tooltip        = getSlotOrNull(instance.options.slots?.baseTooltip);
  const IconButton     = getSlotOrNull(instance.options.slots?.baseIconButton);
  const Switch         = getSlotOrNull(instance.options.slots?.baseSwitch);
  const PopoverWrapper = getSlotOrNull(instance.options.slots?.basePopoverWrapper);
  const PopoverTarget  = getSlotOrNull(instance.options.slots?.basePopoverTarget);
  const PopoverContent = getSlotOrNull(instance.options.slots?.basePopoverContent);

  return (
    <PopoverWrapper 
      {...instance.options.slotProps?.basePopoverWrapper}
      open={popoverOpen}
      setOpen={setPopoverOpen}
      targetRef={popoverTargetRef}
    >
      <PopoverTarget {...instance.options.slotProps?.basePopoverTarget}>
        <Tooltip
          {...instance.options.slotProps?.baseTooltip}
          label={instance.localization.toolbarShowHideColumns}
        >
          <IconButton
            ref={popoverTargetRef}
            {...instance.options.slotProps?.baseIconButton}
          >
            {<ColumnsVisibilityIcon {...instance.options.slotProps?.columnsVisibilityIcon} />}
          </IconButton>
        </Tooltip>
      </PopoverTarget>
      
      <PopoverContent
        {...instance.options.slotProps?.basePopoverContent}
        open={popoverOpen}
        setOpen={setPopoverOpen}
        targetRef={popoverTargetRef}
      >
        <div
          className={clsx(
              "DataGridToolbar--columnsMenu-root", 
              styles["columnsMenu-root"]
            )
          }
        >
          <div 
            className={clsx(
              "DataGridToolbar--columnsMenu-selectors", 
              styles["columnsMenu-selectors"]
            )}
          >
            {instance.getAllLeafColumns().map(column => !column.columnDef.hideFromColumnsMenu ? (
              <Switch 
                {...instance.options.slotProps?.baseSwitch}
                key={column.id} 
                label={column.columnDef.columnTitle || column.id}
                checked={column.getIsVisible()} 
                onChange={(...args) => {
                  column.toggleVisibility();
                  instance.options.slotProps?.baseSwitch?.onChange?.(...args);
                }}
                disabled={column.getCanHide() === false}
              />
            ) : null)}
          </div>

          <div 
            className={clsx(
              "DataGridToolbar--columnsMenu-actions", 
              styles["columnsMenu-actions"]
            )}
          >
            <Button
              {...instance.options.slotProps?.baseButton}
              onClick={(...args) => {
                instance.toggleAllColumnsVisible(true);
                instance.options.slotProps?.baseButton?.onClick?.(...args);
              }}
              disabled={instance.getIsAllColumnsVisible()}
            >
              {instance.localization.toolbarShowAllColumns}
            </Button>

            <Button
              {...instance.options.slotProps?.baseButton}
              onClick={(...args) => {
                instance.toggleAllColumnsVisible(false);
                instance.options.slotProps?.baseButton?.onClick?.(...args);
              }}
              disabled={!instance.getIsSomeColumnsVisible()}
            >
              {instance.localization.toolbarHideAllColumns}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </PopoverWrapper>
  );

  // return (
  //   <Popover position="bottom-end">
  //     <Popover.Target>
  //       <Tooltip
  //         {...instance.options.slotProps?.baseTooltip}
  //         label={instance.localization.toolbarShowHideColumns}
  //       >
  //         <IconButton
  //           {...instance.options.slotProps?.baseIconButton}
  //         >
  //           {<ColumnsVisibilityIcon {...instance.options.slotProps?.columnsVisibilityIcon} />}
  //         </IconButton>
  //       </Tooltip>
  //     </Popover.Target>
      
  //     <Popover.Dropdown 
  //       classNames={{ 
  //         dropdown: clsx(
  //           "DataGridToolbar--columnsMenu-root", 
  //           styles["columnsMenu-root"]
  //         )
  //       }}
  //     >
  //       <div 
  //         className={clsx(
  //           "DataGridToolbar--columnsMenu-selectors", 
  //           styles["columnsMenu-selectors"]
  //         )}
  //       >
  //         {instance.getAllLeafColumns().map(column => !column.columnDef.hideFromColumnsMenu ? (
  //           <Switch 
  //             {...instance.options.slotProps?.baseSwitch}
  //             key={column.id} 
  //             label={column.columnDef.columnTitle || column.id}
  //             checked={column.getIsVisible()} 
  //             onChange={(...args) => {
  //               column.toggleVisibility();
  //               instance.options.slotProps?.baseSwitch?.onChange?.(...args);
  //             }}
  //             disabled={column.getCanHide() === false}
  //           />
  //         ) : null)}
  //       </div>

  //       <div 
  //         className={clsx(
  //           "DataGridToolbar--columnsMenu-actions", 
  //           styles["columnsMenu-actions"]
  //         )}
  //       >
  //         <Button
  //           {...instance.options.slotProps?.baseButton}
  //           onClick={(...args) => {
  //             instance.toggleAllColumnsVisible(true);
  //             instance.options.slotProps?.baseButton?.onClick?.(...args);
  //           }}
  //           disabled={instance.getIsAllColumnsVisible()}
  //         >
  //           {instance.localization.toolbarShowAllColumns}
  //         </Button>

  //         <Button
  //           {...instance.options.slotProps?.baseButton}
  //           onClick={(...args) => {
  //             instance.toggleAllColumnsVisible(false);
  //             instance.options.slotProps?.baseButton?.onClick?.(...args);
  //           }}
  //           disabled={!instance.getIsSomeColumnsVisible()}
  //         >
  //           {instance.localization.toolbarHideAllColumns}
  //         </Button>
  //       </div>
  //     </Popover.Dropdown>
  //   </Popover>
  // );
}

export default ToolbarColumnVisibilityToggle;

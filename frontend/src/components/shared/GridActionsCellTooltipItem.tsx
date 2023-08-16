import { FC } from "react";
import { GridActionsCellItem, GridActionsCellItemProps } from "@mui/x-data-grid";
import Tooltip, { TooltipProps } from "@mui/material/Tooltip";

export type GridActionsCellTooltipItemProps = GridActionsCellItemProps & {
  tooltipProps: Omit<TooltipProps, "children">;
}

export const GridActionsCellTooltipItem: FC<GridActionsCellTooltipItemProps> = ({ tooltipProps, ...props }) => {
  return (
    <Tooltip {...tooltipProps}>
      <span>
        <GridActionsCellItem
          {...props as any}
        />
      </span>
    </Tooltip>
  );
}
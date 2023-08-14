import { FC, ReactNode, createContext, MouseEvent, useContext } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { 
  GridToolbarColumnsButton, 
  GridToolbarContainer, 
  GridToolbarDensitySelector, 
  GridToolbarExport, 
  GridToolbarFilterButton, 
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";

import SyncIcon from "@mui/icons-material/Sync";

/**
 * Requires GridToolbarExtendedProvider for extra components.
 * @returns A GridToolbar with quick filter, columns, filter, density
 * and refresh buttons.
 */
export const GridToolbarExtended = () => {
  const ctx = useGridToolbarExtended();

  return (
    <GridToolbarContainer className="flex flex-col md:flex-row">
      <div className="flex flex-1 items-center w-full md:w-auto">
        <GridToolbarQuickFilter />
      </div>

      <div className="w-full md:w-auto flex items-center flex-wrap">
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport
          printOptions={{
            disableToolbarButton: true,
          }}
        />
        {!ctx.hideRefreshButton ? (
          <Tooltip
            title="Refrescar"
            className="text-neutral-800"
            disableInteractive
          >
            <IconButton 
              color="inherit" 
              size="small"
              onClick={e => ctx.onRefreshButtonClick?.(e)}
            >
              <SyncIcon />
            </IconButton>
          </Tooltip>
        ) : null}
      </div>
    </GridToolbarContainer>
  );
};

export interface GridToolbarExtendedContextProps {
  hideRefreshButton?: boolean;
  onRefreshButtonClick?: (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => void;
}

export const GridToolbarExtendedContext = createContext<GridToolbarExtendedContextProps>({});

export interface GridToolbarExtendedProviderProps extends GridToolbarExtendedContextProps {
  children?: ReactNode;
}

export const GridToolbarExtendedProvider: FC<GridToolbarExtendedProviderProps> = ({
  children, ...other
}) => {
  return (
    <GridToolbarExtendedContext.Provider value={other}>
      {children}
    </GridToolbarExtendedContext.Provider>
  )
};

export const useGridToolbarExtended = () => useContext(GridToolbarExtendedContext);

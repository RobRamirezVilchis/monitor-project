import { CSSProperties, createContext, useContext } from "react";

import type { 
  DataGridBodyClassNames,
  DataGridBodyStyles,
  DataGridColumnHeadersClassNames,
  DataGridColumnHeadersStyles,
  DataGridFooterClassNames,
  DataGridFooterStyles,
  DataGridHeaderClassNames,
  DataGridHeaderStyles,
  DataGridRowCellPropsClassNames,
  DataGridRowCellPropsStyles,
  DataGridRowClassNames,
  DataGridRowStyles,
} from "../types";

export interface DataGridContextProps {
  loading?: boolean;
  classNames?: {
    root?: string;
    header?: DataGridHeaderClassNames,
    columnHeaders?: DataGridColumnHeadersClassNames,
    body?: DataGridBodyClassNames,
    footer?: DataGridFooterClassNames,
    row?: DataGridRowClassNames;
    cell?: DataGridRowCellPropsClassNames;
  };
  styles?: {
    root?: CSSProperties;
    header?: DataGridHeaderStyles;
    columnHeaders?: DataGridColumnHeadersStyles;
    body?: DataGridBodyStyles;
    footer?: DataGridFooterStyles;
    row?: DataGridRowStyles;
    cell?: DataGridRowCellPropsStyles;
  };
}

export const DataGridContext = createContext<DataGridContextProps>({
  
});

export const useDataGridContext = () => useContext(DataGridContext);

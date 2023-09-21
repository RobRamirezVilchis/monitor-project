import { CSSProperties, ReactNode, useMemo } from "react";
import { Row, RowData } from "@tanstack/react-table";
import clsx from "clsx";

import gridStyles from "./DataGrid.module.css";

import { DataGridContext, DataGridContextProps } from "./DataGridContext";
import { useScroll} from "./components/useScroll";
import type { DataGridDensity, DataGridInstance } from "./types";
import DataGridBody, {
  type DataGridBodyClassNames,
  type DataGridBodyStyles,
} from "./DataGridBody";
import DataGridColumnHeaders, {
  type DataGridColumnHeadersClassNames,
  type DataGridColumnHeadersStyles,
} from "./DataGridColumnHeaders";
import DataGridFooter, {
  type DataGridFooterClassNames,
  type DataGridFooterStyles,
} from "./DataGridFooter";
import DataGridHeader, {
  type DataGridHeaderClassNames,
  type DataGridHeaderStyles,
} from "./DataGridHeader";

export interface DataGridProps<TData extends RowData> {
  instance: DataGridInstance<TData>;
  loading?: boolean;
  classNames?: {
    root?: string;
    header?: DataGridHeaderClassNames,
    columnHeaders?: DataGridColumnHeadersClassNames,
    body?: DataGridBodyClassNames,
    footer?: DataGridFooterClassNames,
  },
  styles?: {
    root?: CSSProperties;
    header?: DataGridHeaderStyles;
    columnHeaders?: DataGridColumnHeadersStyles;
    body?: DataGridBodyStyles;
    footer?: DataGridFooterStyles;
  },
  renderSubComponent?: (row: Row<TData>) => ReactNode;
  /**
   * The height of each row in pixels.
   * @default "normal" (52px)
   */
  density?: DataGridDensity;
}

const DataGrid = <TData extends RowData>({
  instance, 
  loading,
  density = "normal",
  classNames,
  styles,
  renderSubComponent,
}: DataGridProps<TData>) => {
  const mainXScroll = useScroll({ orientation: "horizontal" });
  const mainYScroll = useScroll({ orientation: "vertical" });

  const contextValue = useMemo<DataGridContextProps>(() => ({
    mainXScroll,
    mainYScroll,
  }), [mainXScroll, mainYScroll]);

  return (
    <DataGridContext.Provider value={contextValue}>
      <div className={clsx("DataGrid-root", gridStyles.root, classNames?.root)} style={styles?.root}>
        <DataGridHeader 
          instance={instance} 
          classNames={classNames?.header} 
          styles={styles?.header} 
        />
        <DataGridColumnHeaders 
          instance={instance} 
          classNames={classNames?.columnHeaders} 
          styles={styles?.columnHeaders} 
        />
        <DataGridBody 
          instance={instance}
          loading={loading}
          density={density}
          renderSubComponent={renderSubComponent}
          classNames={classNames?.body}
          styles={styles?.body}
        />
        <DataGridFooter instance={instance} 
          classNames={classNames?.footer}
          styles={styles?.footer}
        />
      </div>
    </DataGridContext.Provider>
  );
};

export default DataGrid;

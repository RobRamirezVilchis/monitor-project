import { ReactNode, useMemo } from "react";
import { Row, RowData } from "@tanstack/react-table";
import clsx from "clsx";

import gridStyles from "./DataGrid.module.css";

import { DataGridContext, DataGridContextProps } from "./DataGridContext";
import { DataGridRefsProvider } from "./DataGridRefsProvider";
import { DataGridScrollProvider } from "./DataGridScrollProvider";
import { DensityContext } from "./DensityContext";
import { useScroll} from "./components/useScroll";
import type { DataGridDensity, DataGridInstance } from "./types";
import DataGridBody from "./DataGridBody";
import DataGridColumnHeaders from "./DataGridColumnHeaders";
import DataGridFooter from "./DataGridFooter";
import DataGridHeader from "./DataGridHeader";

export interface DataGridProps<TData extends RowData> {
  instance: DataGridInstance<TData>;
  loading?: boolean;
  classNames?: DataGridContextProps["classNames"];
  styles?: DataGridContextProps["styles"];
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
    density,
    loading,
    classNames,
    styles,
  }), [mainXScroll, mainYScroll, density, loading, classNames, styles]);

  return (
    <DataGridContext.Provider value={contextValue}>
      <DataGridRefsProvider>
        <DataGridScrollProvider>
          <DensityContext.Provider value={density}>
            <div className={clsx("DataGrid-root", gridStyles.root, classNames?.root)} style={styles?.root}>
              <DataGridHeader instance={instance} />
              <DataGridColumnHeaders instance={instance} />
              <DataGridBody 
                instance={instance}
                loading={loading}
                renderSubComponent={renderSubComponent}
              />
              <DataGridFooter instance={instance} />
            </div>
          </DensityContext.Provider>
        </DataGridScrollProvider>
      </DataGridRefsProvider>
    </DataGridContext.Provider>
  );
};

export default DataGrid;

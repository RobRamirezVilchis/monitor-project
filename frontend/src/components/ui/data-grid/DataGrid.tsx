import { ReactNode, useMemo, useState } from "react";
import { Row, RowData } from "@tanstack/react-table";
import clsx from "clsx";

import gridStyles from "./DataGrid.module.css";

import { DataGridContext, DataGridContextProps } from "./providers/DataGridContext";
import { DataGridRefsProvider } from "./providers/DataGridRefsProvider";
import { DataGridScrollProvider } from "./providers/DataGridScrollProvider";
import { DensityContext } from "./providers/DensityContext";
import type { DataGridDensity, DataGridInstance } from "./types";
import DataGridBody from "./body/DataGridBody";
import DataGridColumnHeaders from "./column-headers/DataGridColumnHeaders";
import DataGridFooter from "./footer/DataGridFooter";
import DataGridHeader from "./header/DataGridHeader";

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
  const contextValue = useMemo<DataGridContextProps>(() => ({
    classNames,
    styles,
  }), [classNames, styles]);

  const [_density, _setDensity] = useState<DataGridDensity>(density);

  const densityCtx = useMemo(() => ({
    density: _density,
    setDensity: _setDensity,
    toggleDensity: () => {
      _setDensity(prev => {
        switch (prev) {
          case "normal":
            return "compact";
          case "compact":
            return "comfortable";
          case "comfortable":
            return "normal";
        }
      });
    },
  }), [_density]);

  return (
    <DataGridContext.Provider value={contextValue}>
      <DataGridRefsProvider>
        <DataGridScrollProvider>
          <DensityContext.Provider value={densityCtx}>
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

import { createContext, useContext, useMemo } from "react";

import type { DataGridDensity } from "./types";

export const densityFactor: Record<DataGridDensity, number> = {
  normal: 1,
  compact: 0.7,
  comfortable: 1.3,
};

export const DensityContext = createContext<DataGridDensity>("normal");

export const useDataGridDensity = () => {
  const density = useContext(DensityContext);
  const ctx = useMemo(() => ({
    value: density,
    factor: densityFactor[density],
    height: Math.floor(52 * (densityFactor[density] ?? 1)),
  }), [density]);

  return ctx;
};

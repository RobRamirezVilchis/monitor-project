import { createContext, useContext, useMemo } from "react";

import type { DataGridDensity } from "../types";

export const densityFactor: Record<DataGridDensity, number> = {
  normal: 1,
  compact: 0.7,
  comfortable: 1.3,
};

export const DensityContext = createContext<{
  density: DataGridDensity;
  setDensity: (density: DataGridDensity) => void;
  toggleDensity: () => void;
}>({
  density: "normal",
  setDensity: () => {},
  toggleDensity: () => {},
});

export const useDataGridDensity = () => {
  const { density, setDensity, toggleDensity } = useContext(DensityContext);
  const ctx = useMemo(() => ({
    value: density,
    factor: densityFactor[density],
    rowHeight: Math.floor(52 * (densityFactor[density] ?? 1)),
    headerHeight: Math.floor(56 * (densityFactor[density] ?? 1)),
  }), [density]);

  const densityCtx = useMemo(() => ({
    ...ctx,
    setDensity,
    toggleDensity,
  }), [ctx, setDensity, toggleDensity]);

  return densityCtx;
};

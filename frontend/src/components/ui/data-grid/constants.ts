import type { DataGridDensity } from "./types";

export const densityFactor: Record<DataGridDensity, number> = {
  normal: 1,
  compact: 0.7,
  comfortable: 1.3,
};
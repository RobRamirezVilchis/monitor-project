import { createContext, useContext } from "react";

import { UseScrollReturn } from "./components/useScroll";

export interface DataGridContextProps {
  mainXScroll: UseScrollReturn;
  mainYScroll: UseScrollReturn;
}

export const DataGridContext = createContext<DataGridContextProps>({
  mainXScroll: {
    scrollRef: { current: null },
    onScroll: () => {},
    onWheel: () => {},
    onTouchStart: () => {},
    onTouchMove: () => {},
    onTouchEnd: () => {},
    syncScroll: () => {},
    desyncScroll: () => {},
  },
  mainYScroll: {
    scrollRef: { current: null },
    onScroll: () => {},
    onWheel: () => {},
    onTouchStart: () => {},
    onTouchMove: () => {},
    onTouchEnd: () => {},
    syncScroll: () => {},
    desyncScroll: () => {},
  },
});

export const useDataGridContext = () => useContext(DataGridContext);

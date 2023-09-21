import { ReactNode, RefObject, createContext, useContext, useMemo, useRef } from "react";

import { useScroll, UseScrollReturn } from "../components/useScroll";

// Context --------------------------------------------------------------------
export interface DataGridScrollContextProps {
  mainScrollbars: {
    horizontal: UseScrollReturn;
    vertical: UseScrollReturn;
  };
}

export const DataGridScrollContext = createContext<DataGridScrollContextProps>({
  mainScrollbars: {
    horizontal: {
      scrollRef: { current: null },
      onScroll: () => {},
      onWheel: () => {},
      onTouchStart: () => {},
      onTouchMove: () => {},
      onTouchEnd: () => {},
      syncScroll: () => {},
      desyncScroll: () => {},
    },
    vertical: {
      scrollRef: { current: null },
      onScroll: () => {},
      onWheel: () => {},
      onTouchStart: () => {},
      onTouchMove: () => {},
      onTouchEnd: () => {},
      syncScroll: () => {},
      desyncScroll: () => {},
    },
  },
});

// Provider -------------------------------------------------------------------
export interface DataGridScrollProviderProps {
  children: ReactNode;
}

export const DataGridScrollProvider = ({ 
  children,
}: DataGridScrollProviderProps) => {
  const mainHorizontalScroll = useScroll({ orientation: "horizontal" });
  const mainVerticalScroll = useScroll({ orientation: "vertical" });

  const scrollbars: DataGridScrollContextProps = useMemo(() => ({
    mainScrollbars: {
      horizontal: mainHorizontalScroll,
      vertical: mainVerticalScroll,
    },
  }), [mainHorizontalScroll, mainVerticalScroll]);

  return (
    <DataGridScrollContext.Provider value={scrollbars}>
      {children}
    </DataGridScrollContext.Provider>
  );
};

export const useDataGridScrollContext = () => useContext(DataGridScrollContext);

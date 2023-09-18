import { ReactNode, createContext, useContext } from "react";

import { useScroll, UseScrollReturn } from "./components/useScroll";

// Context --------------------------------------------------------------------
export interface ScrollsContextProps {
  xScroll: UseScrollReturn;
  yScroll: UseScrollReturn;
}

export const ScrollsContext = createContext<ScrollsContextProps>({
  xScroll: {
    scrollRef: { current: null },
    onScroll: () => {},
    onWheel: () => {},
    onTouchStart: () => {},
    onTouchMove: () => {},
    onTouchEnd: () => {},
    syncScroll: () => {},
    desyncScroll: () => {},
  },
  yScroll: {
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

// Provider -------------------------------------------------------------------
export interface ScrollsProviderProps {
  children: ReactNode;
}

export const ScrollsProvider = ({ 
  children,
}: ScrollsProviderProps) => {
  const xScroll = useScroll({ orientation: "horizontal" });
  const yScroll = useScroll({ orientation: "vertical" });

  const value: ScrollsContextProps = {
    yScroll,
    xScroll,
  };

  return (
    <ScrollsContext.Provider value={value}>
      {children}
    </ScrollsContext.Provider>
  );
};

export const useScrollsContext = () => {
  return useContext(ScrollsContext);
}
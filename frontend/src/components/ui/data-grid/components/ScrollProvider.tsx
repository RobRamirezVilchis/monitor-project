import { ReactNode, RefObject, createContext, useContext, useEffect, useRef } from "react";

import { useScroll, UseScrollReturn } from "./useScroll";

// Context --------------------------------------------------------------------
export interface ScrollContextProps {
  xScroll: UseScrollReturn;
  yScroll: UseScrollReturn;
}

export const ScrollContext = createContext<ScrollContextProps>({
  xScroll: {
    scrollRef: { current: null },
    contentRef: { current: null },
    onScroll: () => {},
    onWheel: () => {},
    onTouchStart: () => {},
    onTouchMove: () => {},
    onTouchEnd: () => {},
  },
  yScroll: {
    scrollRef: { current: null },
    contentRef: { current: null },
    onScroll: () => {},
    onWheel: () => {},
    onTouchStart: () => {},
    onTouchMove: () => {},
    onTouchEnd: () => {},
  },
});

// Provider -------------------------------------------------------------------
export interface ScrollProviderProps {
  children: ReactNode;
}

export const ScrollProvider = ({ 
  children,
}: ScrollProviderProps) => {
  const xScroll = useScroll({ orientation: "horizontal" });
  const yScroll = useScroll({ orientation: "vertical" });

  const value: ScrollContextProps = {
    yScroll,
    xScroll,
  };

  return (
    <ScrollContext.Provider value={value}>
      {children}
    </ScrollContext.Provider>
  );
};

export const useScrollContext = () => {
  return useContext(ScrollContext);
}
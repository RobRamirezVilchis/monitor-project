import { useVirtualizer, Virtualizer } from "@tanstack/react-virtual";
import { ReactNode, createContext, useContext, useEffect, useRef } from "react";
import { useDataGridScrollContext } from "./DataGridScrollProvider";
import { useDataGridDensity } from "./DensityContext";


export const DataGridVerticalVirtualizerContext = createContext<Virtualizer<HTMLDivElement, Element> | null>(null);
export const DataGridHorizontalVirtualizerContext = createContext<Virtualizer<HTMLDivElement, Element> | null>(null);

// --------------------------------------------------------

export interface DataGridVerticalVirtualizerProviderProps {
  children: ReactNode;
  overscan?: number;
  rowsCount: number;
  estimateSize?: (index: number) => number;
}

export interface DataGridHorizontalVirtualizerProviderProps {
  children: ReactNode;
  overscan?: number;
  columnsCount: number;
  estimateSize?: (index: number) => number;
}

export const DataGridVerticalVirtualizerProvider = ({
  children,
  rowsCount,
  overscan = 1,
  estimateSize,
}: DataGridVerticalVirtualizerProviderProps) => {
  const { mainScrollbars } = useDataGridScrollContext();
  const { rowHeight } = useDataGridDensity();
  const prevRowHeight = useRef(rowHeight);
  estimateSize = estimateSize ?? (() => rowHeight);
  
  const virtualizer = useVirtualizer({
    count: rowsCount,
    getScrollElement: () => mainScrollbars.vertical.scrollRef.current,
    estimateSize,
    horizontal: false,
    overscan,
  });

  useEffect(() => {
    if (prevRowHeight.current === rowHeight) return;
    prevRowHeight.current = rowHeight;
    virtualizer.measure();
  }, [rowHeight, virtualizer]);

  return (
    <DataGridVerticalVirtualizerContext.Provider value={virtualizer}>
      {children}
    </DataGridVerticalVirtualizerContext.Provider>
  );
}

export const DataGridHorizontalVirtualizerProvider = ({
  children,
  columnsCount,
  overscan = 1,
  estimateSize = () => 100,
}: DataGridHorizontalVirtualizerProviderProps) => {
  const { mainScrollbars } = useDataGridScrollContext();

  const virtualizer = useVirtualizer({
    count: columnsCount,
    getScrollElement: () => mainScrollbars.horizontal.scrollRef.current,
    estimateSize,
    horizontal: true,
    overscan,
  });

  return (
    <DataGridHorizontalVirtualizerContext.Provider value={virtualizer}>
      {children}
    </DataGridHorizontalVirtualizerContext.Provider>
  );
}

export type DataGridVirtualizerProviderProps = {
  children: ReactNode;
} & ({
  horizontal?: false;
  horizontalVirtualizerProps?: undefined;
} | {
  horizontal: true;
  horizontalVirtualizerProps: Omit<DataGridHorizontalVirtualizerProviderProps, "children">;
}) & ({
  vertical?: false;
  verticalVirtualizerProps?: undefined;
} | {
  vertical: true;
  verticalVirtualizerProps: Omit<DataGridVerticalVirtualizerProviderProps, "children">;
})

const Empty = ({ children }: any) => <>{children}</>;

export const DataGridVirtualizerProvider = ({
  children,
  vertical = false,
  horizontal = false,
  verticalVirtualizerProps,
  horizontalVirtualizerProps,
}: DataGridVirtualizerProviderProps) => {
  const Horizontal = horizontal ? DataGridHorizontalVirtualizerProvider : Empty;
  const Vertical = vertical ? DataGridVerticalVirtualizerProvider : Empty;

  return (
    <DataGridHorizontalVirtualizerContext.Provider value={null}>
      <DataGridVerticalVirtualizerContext.Provider value={null}>
        <Horizontal {...horizontalVirtualizerProps as any}>
          <Vertical {...verticalVirtualizerProps as any}>
            {children}
          </Vertical>
        </Horizontal>
      </DataGridVerticalVirtualizerContext.Provider>
    </DataGridHorizontalVirtualizerContext.Provider>
  );
};

export const useVerticalVirtualizer = () => useContext(DataGridVerticalVirtualizerContext);
export const useHorizontalVirtualizer = () => useContext(DataGridHorizontalVirtualizerContext);

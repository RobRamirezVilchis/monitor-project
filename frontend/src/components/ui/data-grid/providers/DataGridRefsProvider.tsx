import { ReactNode, RefObject, createContext, useContext, useMemo, useRef } from "react";

// Context --------------------------------------------------------------------
export interface DataGridRefsContextProps {
  contentRefs: {
    main: RefObject<HTMLDivElement>;
  },
  columnHeaderRefs: {
    main: RefObject<HTMLDivElement>;
  },
  headerRef: RefObject<HTMLDivElement>;
  footerRef: RefObject<HTMLDivElement>;
}

export const DataGridRefsContext = createContext<DataGridRefsContextProps>({
  contentRefs: {
    main: { current: null },
  },
  columnHeaderRefs: {
    main: { current: null },
  },
  headerRef: { current: null },
  footerRef: { current: null },
});

// Provider -------------------------------------------------------------------
export interface DataGridRefsProviderProps {
  children: ReactNode;
}

export const DataGridRefsProvider = ({ 
  children,
}: DataGridRefsProviderProps) => {
  const mainContentRef = useRef<HTMLDivElement>(null);
  
  const mainColumnsHeaderRef = useRef<HTMLDivElement>(null);
  
  const headerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  const refs: DataGridRefsContextProps = useMemo(() => ({
    contentRefs: {
      main: mainContentRef,
    },
    columnHeaderRefs: {
      main: mainColumnsHeaderRef,
    },
    headerRef: headerRef,
    footerRef: footerRef,
  }), []);

  return (
    <DataGridRefsContext.Provider value={refs}>
      {children}
    </DataGridRefsContext.Provider>
  );
};

export const useDataGridRefsContext = () => useContext(DataGridRefsContext);

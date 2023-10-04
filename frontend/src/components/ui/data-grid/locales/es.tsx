import type { DataGridLocalization } from "../types";

export const es: DataGridLocalization = {
    toolbarShowHideFilters: "Mostrar/Ocultar filtros",
    toolbarShowHideColumns: "Mostrar/Ocultar columnas",
    toolbarShowAllColumns: "Mostrar todo",
    toolbarHideAllColumns: "Ocultar todo",
    toolbarToggleDensity: "Alternar densidad",
    toolbarToggleFullscreen: "Alternar pantalla completa",
    toolbarQuickFilterPlaceholder: "Buscar...",
  
    columnPanelSortByLabel: ({ direction, nextDirection, column }) => direction 
    ? `Ordenado por ${column.id} (${direction === "desc" ? "descendente" : "ascendente"})`
    : `Ordenar por ${column.id} (${nextDirection === "desc" ? "descendente" : "ascendente"})`,
    columnPanelDragHandleLabel: "Arrastra para reordenar columna",
    columnPanelMenuLabel: "Menú",
    columnMenuSortByAscending: (column) => `Ordenar por ${column.id} (ascendente)`,
    columnMenuSortByDescending: (column) => `Ordenar por ${column.id} (descendente)`,
    columnMenuClearSortBy: (column) => `Limpiar orden por ${column.id}`,
    columnMenuHideColumn: "Ocultar columna",
  
    paginationFirstPage: "Primera página",
    paginationLastPage: "Última página",
    paginationPreviousPage: "Página anterior",
    paginationNextPage: "Página siguiente",
    paginationLabelRowsPerPage: "Filas por página",
    paginationLabelDisplayRows: (info: {
      from: number;
      to: number;
      count: number;
      page: number;
      pageCount: number;
    }) => `${info.from}-${info.to} de ${info.count}`,
  
    rowExpandRowIconLabel: "Expandir fila",
    rowCollapseRowIconLabel: "Colapsar fila",
    noRowsLabel: "Sin filas",
    noResultsOverlayLabel: "Sin resultados",
    loadingOverlayLabel: "Cargando...",

    footerSelectedRowCount: (count) => count === 1 ? "1 fila seleccionada" : `${count} filas seleccionadas`,
};
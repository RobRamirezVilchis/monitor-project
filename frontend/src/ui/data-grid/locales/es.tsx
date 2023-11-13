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
  ? `Ordenado por ${column.columnDef.columnTitle || column.id} (${direction === "desc" ? "descendente" : "ascendente"})`
  : `Ordenar por ${column.columnDef.columnTitle || column.id} (${nextDirection === "desc" ? "descendente" : "ascendente"})`,
  columnPanelDragHandleLabel: "Arrastra para reordenar columna",
  columnPanelMenuLabel: "Menú",
  columnMenuSortByAscending: (column) => `Ordenar por ${column.columnDef.columnTitle || column.id} (ascendente)`,
  columnMenuSortByDescending: (column) => `Ordenar por ${column.columnDef.columnTitle || column.id} (descendente)`,
  columnMenuClearSortBy: (column) => `Limpiar orden por ${column.columnDef.columnTitle || column.id}`,
  columnMenuHideColumn: "Ocultar columna",

  paginationFirstPage: "Primera página",
  paginationLastPage: "Última página",
  paginationPreviousPage: "Página anterior",
  paginationNextPage: "Página siguiente",
  paginationLabelRowsPerPage: "Filas por página",
  paginationLabelDisplayRows: (info) => `${info.from}-${info.to} de ${info.count}`,

  expandRowLabel: "Expandir fila",
  expandAllRowsLabel: "Expandir todo",
  collapseRowLabel: "Colapsar fila",
  collapseAllRowsLabel: "Colapsar todo",
  noRowsLabel: "Sin filas",
  noResultsOverlayLabel: "Sin resultados",
  loadingOverlayLabel: "Cargando...",

  footerSelectedRowCount: (count) => count === 1 ? "1 fila seleccionada" : `${count} filas seleccionadas`,

  filterByPlaceholder: (column) => `Filtrar por ${column.columnDef.columnTitle || column.id}...`,
  filterByCheckboxLabel: (checked, column) => `Mostrando ${checked === undefined ? "todo" : checked ? "verdaderos" : "falsos"} de ${column.columnDef.columnTitle || column.id}`,
  filterMinPlaceholder: "Mín",
  filterMaxPlaceholder: "Máx",
};
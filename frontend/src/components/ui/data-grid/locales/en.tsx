import type { DataGridLocalization } from "../types";

export const en: DataGridLocalization = {
  toolbarShowHideFilters: "Show/Hide filters",
  toolbarShowHideColumns: "Show/Hide columns",
  toolbarShowAllColumns: "Show all",
  toolbarHideAllColumns: "Hide all",
  toolbarToggleDensity: "Toggle density",
  toolbarToggleFullscreen: "Toggle fullscreen",
  toolbarQuickFilterPlaceholder: "Search...",

  columnPanelSortByLabel: ({ direction, nextDirection, column }) => direction 
    ? `Sorted by ${column.id} (${direction === "desc" ? "descending" : "ascending"})`
    : `Sort by ${column.id} (${nextDirection === "desc" ? "descending" : "ascending"})`,
  columnPanelDragHandleLabel: "Drag to reorder column",
  columnPanelMenuLabel: "Menu",
  columnMenuSortByAscending: (column) => `Sort by ${column.id} (ascending)`,
  columnMenuSortByDescending: (column) => `Sort by ${column.id} (descending)`,
  columnMenuClearSortBy: (column) => `Clear sort by ${column.id}`,
  columnMenuHideColumn: "Hide column",

  paginationFirstPage: "First page",
  paginationLastPage: "Last page",
  paginationPreviousPage: "Previous page",
  paginationNextPage: "Next page",
  paginationLabelRowsPerPage: "Rows per page",
  paginationLabelDisplayRows: (info: {
    from: number;
    to: number;
    count: number;
    page: number;
    pageCount: number;
  }) => `${info.from}-${info.to} of ${info.count}`,

  rowExpandRowIconLabel: "Expand row",
  rowCollapseRowIconLabel: "Collapse row",
  noRowsLabel: "No rows",
  noResultsOverlayLabel: "No results",
  loadingOverlayLabel: "Loading...",

  footerSelectedRowCount: (count) => count === 1 ? "1 row selected" : `${count} rows selected`,
};

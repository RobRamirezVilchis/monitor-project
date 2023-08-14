import { SxProps, Theme } from "@mui/material";
import { 
  GridToolbarColumnsButton, 
  GridToolbarContainer, 
  GridToolbarDensitySelector, 
  GridToolbarExport, 
  GridToolbarFilterButton, 
  GridToolbarQuickFilter,
  DataGrid as MuiDataGrid, 
  DataGridProps as MuiDataGridProps,
} from "@mui/x-data-grid";
import { FC } from "react";

export interface DataGridProps extends MuiDataGridProps {
  striped?: boolean;
  stripedColors?: {
    even?: string;
    odd?: string;
  }
}

export const DataGrid: FC<DataGridProps> = ({ 
  striped, stripedColors, ...props 
}) => {
  const stripedSx: SxProps<Theme> = striped
  ? {
      "& .MuiDataGrid-row:nth-of-type(even)": {
        backgroundColor: stripedColors?.even || "#F5F5F5",
      },
      "& .MuiDataGrid-row:nth-of-type(odd)": {
        backgroundColor: stripedColors?.odd || "#FFF",
      },
    }
  : {};

  return (
    <MuiDataGrid
      {...props}
      localeText={{
        noRowsLabel: "Sin datos",
        noResultsOverlayLabel: "No hay resultados",
        columnsPanelHideAllButton: "Ocultar todas",
        columnsPanelShowAllButton: "Mostrar todas",
        columnsPanelTextFieldLabel: "Buscar columna",
        columnsPanelDragIconLabel: "Reordenar columna",
        columnsPanelTextFieldPlaceholder: "Título de columna",
        toolbarExport: "Exportar",
        toolbarExportCSV: "Exportar CSV",
        toolbarExportPrint: "Imprimir",
        toolbarColumns: "Columnas",
        toolbarFilters: "Filtros",
        toolbarDensity: "Densidad",
        toolbarFiltersTooltipHide: "Ocultar filtros",
        toolbarFiltersTooltipShow: "Mostrar filtros",
        toolbarFiltersLabel: "Filtros",
        columnMenuHideColumn: "Ocultar columna",
        columnMenuSortAsc: "Ordenar ASC",
        columnMenuSortDesc: "Ordenar DESC",
        columnMenuUnsort: "Desordenar",
        columnMenuFilter: "Filtrar",
        filterPanelColumns: "Columna",
        filterPanelInputLabel: "Valor",
        filterOperatorAfter: "después",
        filterOperatorBefore: "antes",
        filterOperatorOnOrAfter: "en o después",
        filterOperatorOnOrBefore: "en o antes",
        filterPanelOperatorAnd: "Y",
        filterPanelOperatorOr: "O",
        filterOperatorContains: "contiene",
        filterOperatorEquals: "igual a",
        filterOperatorStartsWith: "inicia con",
        filterOperatorEndsWith: "termina con",
        filterOperatorIsEmpty: "está vacío",
        filterOperatorIsNotEmpty: "no está vacío",
        filterOperatorIsAnyOf: "es cualquiera de",
        filterPanelInputPlaceholder: "Valor de filtro",
        toolbarQuickFilterPlaceholder: "Buscar...",
        toolbarFiltersTooltipActive: (count) => `${count} filtro(s) activo(s)`,
        columnHeaderFiltersTooltipActive: (count) =>
          `${count} filtro(s) activo(s)`,
        footerRowSelected: (count) =>
          `${count} ${
            count === 1 ? "fila seleccionada" : "filas seleccionadas"
          }`,
        MuiTablePagination: {
          nextIconButtonProps: {
            title: "Siguiente página",
          },
          backIconButtonProps: {
            title: "Página anterior",
          },
          labelRowsPerPage: "Filas por página",
          labelDisplayedRows: function defaultLabelDisplayedRows({
            from,
            to,
            count,
          }) {
            return `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`;
          },
        },
      }}
      classes={{
        root: "overflow-hidden rounded-xl shadow-md h-full !border-none",
        main: "text-neutral-800 bg-white",
        footerContainer: "!border-none bg-white",
        columnHeaderTitleContainer: "text-white",
        columnHeaderTitle: "font-bold",
        columnHeader: "!outline-none",
        row: "border-b border-neutral-200",
        toolbarContainer: "justify-end text-neutral-800",
        sortIcon: "text-neutral-100",
      }}
      density="compact"
      sx={{
        ...stripedSx,
        ...baseDataGridSx,
        "& .MuiDataGrid-columnHeaders": {
          backgroundColor: "#1D1D1B",
        },
        "& .MuiDataGrid-columnHeaderTitleContainerContent": {
          "& .MuiCheckbox-root": {
            color: "white !important",
          },
        },
        "& .MuiDataGrid-row.Mui-selected": {
          backgroundColor: "color-mix(in srgb, #1D1D1B 60%, transparent)",
          "&:hover": {
            backgroundColor: "#1D1D1B",
          }
        },
      }}
      slotProps={{
        baseButton: {
          className: "!text-neutral-800",
        },
        baseCheckbox: {
          color: "success",
        },
        baseSwitch: {
          color: "success",
        },
        baseTextField: {
          sx: {
            "& .MuiInputLabel-root": {
              color: "#1D1D1B !important",
            }, "& .MuiInputBase-root::after": {
              borderBottom: "2px solid #1D1D1B",
            }
          },
        },
      }}
    />
  );
};

const baseDataGridSx: SxProps<Theme> = {
  "& 	.MuiDataGrid-cell": {
    border: "none",
  },
  "& .MuiDataGrid-columnHeader:focus, .MuiDataGrid-columnHeader:active, & .MuiDataGrid-cell:focus, & .MuiDataGrid-cell--withRenderer": {
    outline: "none !important",
  },
  "& .MuiDataGrid-columnHeader .MuiDataGrid-columnSeparator": {
    display: "none",
  }
};

export const DefaultGridToolbar = () => (
  <GridToolbarContainer>
    <GridToolbarColumnsButton />
    <GridToolbarFilterButton />
    <GridToolbarDensitySelector />
    <GridToolbarExport 
       printOptions={{
        disableToolbarButton: true,
      }}
    />
  </GridToolbarContainer>
);

export const GridToolbarWithSearch = () => (
  <GridToolbarContainer className="flex flex-col md:flex-row">
    <div className="flex flex-1 items-center w-full md:w-auto">
      <GridToolbarQuickFilter />
    </div>
    <div className="w-full md:w-auto flex items-center">
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport
         printOptions={{
          disableToolbarButton: true,
        }}
      />
    </div>
  </GridToolbarContainer>
);

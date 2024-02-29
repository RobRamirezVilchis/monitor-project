'use client'

import { useUnitHistoryQuery } from "@/api/queries/monitor";
import { Unit, UnitHistory } from "@/api/services/monitor/types";
import { withAuth } from "@/components/auth/withAuth";
import { useDataGrid, useSsrDataGrid, usePrefetchPaginatedAdjacentQuery } from "@/hooks/data-grid";
import DataGrid from "@/ui/data-grid/DataGrid";
import { ColumnDef } from "@/ui/data-grid/types";
import { parseISO, lightFormat } from "date-fns";




const UnitPage = ({ params }: { params: { unit: string } }) => {
    const unit_obj: Unit = ({
        name: params.unit,
    });
    

    const {
        dataGridState, queryVariables, dataGridConfig
      } = useSsrDataGrid<{ name: string }>({
        defaultSorting: ["register_date"],
        queryStateOptions: {
          navigateOptions: {
            scroll: false,
          },
          history: "replace",
        },
  
    });

    queryVariables.name = params.unit;
    const history_query = useUnitHistoryQuery({
        variables: queryVariables,
    });
    

    const grid = useDataGrid<UnitHistory>({
        data: history_query.data?.data || [],
        columns: cols,
        rowNumberingMode: "static",
        enableRowNumbering: true,
        disableCellSelectionOnClick: true,
        initialState: {
          density: "compact",
        },
        state: {
          loading: history_query.isLoading || history_query.isFetching,
          ...dataGridState,
        },
        enableColumnResizing: true,
        hideColumnFooters: true,
        enableColumnActions: true,
    
        ...dataGridConfig as any,
        pageCount: history_query.data?.pagination?.pages ?? 0,
        rowCount: history_query.data?.pagination?.count ?? 0,
      });

    
    return (
        <section className="flex flex-col h-full lg:container mx-auto pb-2 md:pb-6">
            <div className="flex items-center">
            <h1 className="text-5xl font-bold flex-1 mt-6 mb-4">
                Unidad {params.unit}
            </h1>
            
            </div>
            <DataGrid instance={grid} />
          
        </section>
        
    )

}

//export default UnitPage;
export default withAuth(UnitPage, {
    rolesWhitelist: ["Admin"],
  });

const cols: ColumnDef<UnitHistory>[] = [

    {
        accessorKey: "register_date",
        accessorFn: (row) => lightFormat(parseISO(row.register_datetime), "yyyy-MM-dd"),
        header: "Fecha",
        columnTitle: "Fecha",
        minSize: 150,
        enableSorting: true,
    },
    {
        accessorKey: "register_time",
        accessorFn: (row) => lightFormat(parseISO(row.register_datetime), "HH:mm:SS"),
        header: "Hora",
        columnTitle: "Hora",
        minSize: 150,
        enableSorting: true,
    },
    {
        accessorKey: "status",
        accessorFn: (row) => row.status.charAt(0),
        header: "Estátus",
        columnTitle: "Estátus",
        size: 100,
        enableSorting: true,
    },
    {
        accessorKey: "description",
        accessorFn: (row) => row.description,
        header: "Descripción",
        columnTitle: "Descripción",
        minSize: 300,
        enableSorting: true,
    },
    {
        accessorKey: "on_trip",
        accessorFn: (row) => row.on_trip,
        header: "En viaje",
        columnTitle: "En viaje",
        size: 100,
        enableSorting: true,
    },
    {
        accessorKey: "pending_events",
        accessorFn: (row) => row.pending_events,
        header: "Eventos pendientes",
        columnTitle: "Eventos pendientes",
        minSize: 30,
        enableSorting: true,
    },
    {
        accessorKey: "pending_status",
        accessorFn: (row) => row.pending_status,
        header: "Status pendientes",
        columnTitle: "Status pendientes",
        minSize: 30,
        enableSorting: true,
    },
    {
        accessorKey: "total",
        accessorFn: (row) => row.total,
        header: "Total",
        columnTitle: "Total",
        size: 100,
        enableSorting: true,
    },
    {
        accessorKey: "restart",
        accessorFn: (row) => row.restart,
        header: "restart",
        columnTitle: "restart",
        size: 100,
        enableSorting: true,
    },
    {
        accessorKey: "camera_connection",
        accessorFn: (row) => row.camera_connection,
        header: "Cámaras",
        columnTitle: "Cámaras",
        size: 100,
        enableSorting: true,
    },
    {
        accessorKey: "forced_reboot",
        accessorFn: (row) => row.forced_reboot,
        header: "Forced reboot",
        columnTitle: "Forced reboot",
        size: 100,
        enableSorting: true,
    },
];

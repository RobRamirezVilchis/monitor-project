'use client'

import { useUnitHistoryQuery } from "@/api/queries/monitor";
import { Unit, UnitHistory } from "@/api/services/monitor/types";
import { withAuth } from "@/components/auth/withAuth";
import { useDataGrid, useSsrDataGrid, usePrefetchPaginatedAdjacentQuery } from "@/hooks/data-grid";
import DataGrid from "@/ui/data-grid/DataGrid";
import { ColumnDef } from "@/ui/data-grid/types";
import { parseISO, lightFormat, format } from "date-fns";


type StatusKey = 0 | 1 | 2 | 3 | 4 | 5;
const statusColors: { [key in StatusKey]: string } = {
  0: 'gray',
  1: 'blue',
  2: 'green',
  3: 'yellow',
  4: 'orange',
  5: 'red',
};

const statusNames: { [key in StatusKey]: string } = {
  0: "Inactivo",
  1: "Funcionando",
  2: "Funcionando",
  3: "Alerta",
  4: "Fallando",
  5: "Crítico",
};

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

    const last_log: UnitHistory | undefined = history_query.data?.data[0];
    //console.log(history_query.data?.data)

    let severity = Number(last_log?.status.charAt(0));
    const color = statusColors[severity as StatusKey];

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
            <div className="flex mt-10 mb-4 justify-start gap-4">
                <h1 className="text-5xl font-bold">
                    Unidad {params.unit}
                </h1>
                <div className={`inline-flex px-4 pt-1 pb-0.5 text-3xl font-semibold 
                    bg-${color}-100 border-2 border-${color}-400 rounded-full items-center`}>
                    {statusNames[severity as StatusKey]}
                </div>
            </div>
            <div>
            {last_log ?  
            <div>
                <div>
                <p className="text-2xl">Última conexión: {format(parseISO(last_log?.last_connection), "Pp")}</p>
                </div>
            
                <div>
                <p className="text-2xl">Eventos pendientes - {last_log.pending_events}</p>
                </div>
              
         
                <div>
                <p className="text-2xl">Status pendientes - {last_log.pending_status}</p>
                </div>
            </div>
                
            : <></> }
            
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
        size: 250,
        enableSorting: true,
    },
    {
        accessorKey: "on_trip",
        accessorFn: (row) => row.on_trip,
        header: "Viaje",
        columnTitle: "Viaje",
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
        header: "Restart",
        columnTitle: "Restart",
        size: 100,
    },
    {
        accessorKey: "camera_connection",
        accessorFn: (row) => row.camera_connection,
        header: "Cámaras",
        columnTitle: "Cámaras",
        size: 100,
    },
    {
        accessorKey: "read_only",
        accessorFn: (row) => row.read_only_ssd,
        header: "Read only",
        columnTitle: "Read only SSD",
        size: 100,
    },
    {
        accessorKey: "forced_reboot",
        accessorFn: (row) => row.forced_reboot,
        header: "Forced reboot",
        columnTitle: "Forced reboot",
        size: 100,
    },
    {
        accessorKey: "start",
        accessorFn: (row) => row.start,
        header: "Start",
        columnTitle: "Start",
        size: 100,
    },
    {
        accessorKey: "reboot",
        accessorFn: (row) => row.reboot,
        header: "Reboot",
        columnTitle: "Reboot",
        size: 100,
    },
    {
        accessorKey: "source_missing",
        accessorFn: (row) => row.source_missing,
        header: "SourceID",
        columnTitle: "SourceID",
        size: 100,
       
    },
    {
        accessorKey: "storage_devices",
        accessorFn: (row) => row.storage_devices,
        header: "Memory",
        columnTitle: "Memory",
        size: 100,
    },
];


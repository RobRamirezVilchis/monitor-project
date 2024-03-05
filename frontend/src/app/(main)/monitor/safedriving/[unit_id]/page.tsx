"use client";

import {
  useUnitHistoryQuery,
  useUnitLastStatusChange,
  useUnitStatusQuery,
} from "@/api/queries/monitor";
import { Unit, UnitHistory } from "@/api/services/monitor/types";
import { withAuth } from "@/components/auth/withAuth";
import { useDataGrid, useSsrDataGrid } from "@/hooks/data-grid";
import DataGrid from "@/ui/data-grid/DataGrid";
import { ColumnDef } from "@/ui/data-grid/types";
import { format, formatDistanceToNow, lightFormat, parseISO } from "date-fns";
import { es } from "date-fns/locale";

type StatusKey = 0 | 1 | 2 | 3 | 4 | 5;
const statusColors: { [key in StatusKey]: string } = {
  0: "bg-gray-100 border-gray-400",
  1: "bg-blue-100 border-blue-400",
  2: "bg-green-100 border-green-400",
  3: "bg-yellow-100 border-yellow-400",
  4: "bg-orange-100 border-orange-400",
  5: "bg-red-100 border-red-400",
};

const statusNames: { [key in StatusKey]: string } = {
  0: "Inactivo",
  1: "Funcionando",
  2: "Funcionando",
  3: "Alerta",
  4: "Fallando",
  5: "Crítico",
};

const UnitPage = ({ params }: { params: { unit_id: string } }) => {
  const unit: Unit = {
    name: params.unit_id,
  };

  const { dataGridState, queryVariables, dataGridConfig } = useSsrDataGrid<{
    name: string;
  }>({
    defaultSorting: ["register_date"],
    queryStateOptions: {
      navigateOptions: {
        scroll: false,
      },
      history: "replace",
    },
  });

  const unitStatusQuery = useUnitStatusQuery({
    variables: {
      unit_id: params.unit_id,
    },
  });

  const unitStatus = unitStatusQuery.data;

  const historyQuery = useUnitHistoryQuery({
    variables: {
      unit_id: params.unit_id,
      page: queryVariables.page,
      page_size: queryVariables.page_size,
    },
  });

  const unitLastStatusChange = useUnitLastStatusChange({
    variables: {
      unit_id: params.unit_id,
    },
  });

  let timeAgo: string;
  if (unitLastStatusChange.data != null) {
    timeAgo = formatDistanceToNow(
      unitLastStatusChange.data?.register_datetime,
      {
        addSuffix: true,
        locale: es,
      }
    );
  } else {
    timeAgo = "-";
  }

  const severity = unitStatus?.severity;
  const color = statusColors[severity as StatusKey];

  const grid = useDataGrid<UnitHistory>({
    data: historyQuery.data?.data || [],
    columns: cols,
    rowNumberingMode: "static",
    enableRowNumbering: true,
    disableCellSelectionOnClick: true,
    initialState: {
      density: "compact",
    },
    state: {
      loading: historyQuery.isLoading || historyQuery.isFetching,
      ...dataGridState,
    },
    enableColumnResizing: true,
    hideColumnFooters: true,
    enableColumnActions: true,

    ...(dataGridConfig as any),
    pageCount: historyQuery.data?.pagination?.pages ?? 0,
    rowCount: historyQuery.data?.pagination?.count ?? 0,
  });

  return (
    <section className="flex flex-col h-full lg:container mx-auto pb-2 md:pb-6">
      <div className="flex mt-10 mb-4 justify-between items-center">
        <div className="flex  justify-start gap-4">
          <h1 className="text-5xl font-bold">Unidad {unitStatus?.unit}</h1>
          <div
            className={`inline-flex px-4 pt-1 pb-0.5 text-3xl font-semibold 
                    border-2 ${color} rounded-full items-center`}
          >
            {statusNames[severity as StatusKey]}
          </div>
          <div className="flex gap-3 text-xl pt-2 text-gray-500 items-center">
            <div>{unitStatus?.description}</div>
            <div>|</div>
            <div>Desde {timeAgo}</div>
          </div>
        </div>
        {unitStatus?.on_trip && (
          <div className="flex items-center">
            <span className="animate-ping inline-flex h-4 w-4 rounded-full bg-blue-400 opacity-100"></span>
            <div className="text-3xl font-semibold ml-4">En viaje</div>
          </div>
        )}
      </div>

      <div>
        {unitStatus && (
          <div className="text-gray-500">
            {unitStatus.last_connection && (
              <div>
                <p className="text-2xl">
                  Última conexión:{" "}
                  {format(parseISO(unitStatus.last_connection), "Pp")}
                </p>
              </div>
            )}
            {unitStatus.last_connection && (
              <div>
                <p className="text-2xl">
                  Eventos pendientes - {unitStatus.pending_events}
                </p>
              </div>
            )}
            {unitStatus.last_connection && (
              <div>
                <p className="text-2xl">
                  Status pendientes - {unitStatus.pending_status}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <DataGrid instance={grid} />
    </section>
  );
};

//export default UnitPage;
export default withAuth(UnitPage, {
  rolesWhitelist: ["Admin"],
});

const cols: ColumnDef<UnitHistory>[] = [
  {
    accessorKey: "register_date",
    accessorFn: (row) =>
      lightFormat(parseISO(row.register_datetime), "yyyy-MM-dd"),
    header: "Fecha",
    columnTitle: "Fecha",
    minSize: 150,
    enableSorting: true,
    filterVariant: "date-range",
    filterProps: {
      zeroTimeUpTo: "hours",
    },
  },
  {
    accessorKey: "register_time",
    accessorFn: (row) =>
      lightFormat(parseISO(row.register_datetime), "HH:mm:SS"),
    header: "Hora",
    columnTitle: "Hora",
    minSize: 150,
    enableSorting: true,
  },
  {
    accessorKey: "status",
    accessorFn: (row) => row.severity,
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

"use client";

import {
  useUnitHistoryQuery,
  useUnitLastStatusChange,
  useUnitStatusQuery,
} from "@/api/queries/monitor";
import { Unit, UnitHistory } from "@/api/services/monitor/types";

import { useDataGrid, useSsrDataGrid } from "@/hooks/data-grid";
import DataGrid from "@/ui/data-grid/DataGrid";
import { ColumnDef } from "@/ui/data-grid/types";
import { format, formatDistanceToNow, lightFormat, parseISO } from "date-fns";
import { es } from "date-fns/locale";

type StatusKey = 0 | 1 | 2 | 3 | 4 | 5;
const statusStyles: { [key in StatusKey]: string } = {
  0: "bg-gray-100 border-gray-400 text-gray-900",
  1: "bg-blue-100 border-blue-400 text-blue-900",
  2: "bg-green-100 border-green-400 text-green-900",
  3: "bg-yellow-100 border-yellow-400 text-yellow-900",
  4: "bg-orange-100 border-orange-400 text-orange-900",
  5: "bg-red-100 border-red-400 text-red-900",
};

const statusNames: { [key in StatusKey]: string } = {
  0: "Inactivo",
  1: "Funcionando",
  2: "Normal",
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
    register_datetime: [Date | null, Date | null];
  }>({
    defaultSorting: ["register_datetime"],
    queryStateOptions: {
      navigateOptions: {
        scroll: false,
      },
      history: "replace",
    },
    transform: {
      register_datetime: (key, value) => {
        if (!value) return {};
        const result: any = {};
        if (value[0]) {
          result[`${key}_after`] = value[0];
        }
        if (value[1]) {
          result[`${key}_before`] = value[1];
        }
        return result;
      },
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
      ...queryVariables,
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
  const color = statusStyles[severity as StatusKey];

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
    enableMultiSort: true,
    pageCount: historyQuery.data?.pagination?.pages ?? 0,
    rowCount: historyQuery.data?.pagination?.count ?? 0,
  });

  return (
    <section>
      <div className="flex mt-10 mb-4 justify-between items-center">
        <div className="xl:flex xl:gap-6">
          <h1 className="text-5xl font-bold">Unidad {unitStatus?.unit}</h1>
          <div className="md:flex justify-start items-center gap-4 mt-4 xl:mt-0">
            <div
              className={`inline-flex h-fit px-4 pt-1 pb-0.5 text-3xl font-semibold mb-2 md:mb-0
                    border-2 ${color} rounded-full items-center`}
            >
              {statusNames[severity as StatusKey]}
            </div>
            <div className="flex gap-3 text-xl text-gray-500 items-center">
              <div className="shrink">{unitStatus?.description}</div>
              <div>|</div>
              <div>Desde {timeAgo}</div>
            </div>
          </div>
        </div>
        {unitStatus?.on_trip && (
          <div className="flex items-center top-0">
            <span className="animate-ping inline-flex h-4 w-4 rounded-full bg-blue-400 opacity-100"></span>
            <div className="text-3xl font-semibold ml-4">En viaje</div>
          </div>
        )}
      </div>

      <div>
        {unitStatus && (
          <div className="text-xl text-gray-500">
            {unitStatus.last_connection && (
              <p>
                Última conexión:{" "}
                {format(parseISO(unitStatus.last_connection), "Pp")}
              </p>
            )}
            {unitStatus.last_connection && (
              <p>Eventos pendientes - {unitStatus.pending_events}</p>
            )}
            {unitStatus.last_connection && (
              <p>Status pendientes - {unitStatus.pending_status}</p>
            )}
          </div>
        )}
      </div>
      <div className="h-[80vh]">
        <DataGrid instance={grid} />
      </div>
    </section>
  );
};

//export default UnitPage;
export default UnitPage;

const cols: ColumnDef<UnitHistory>[] = [
  {
    accessorKey: "register_datetime",
    accessorFn: (row) => format(parseISO(row.register_datetime), "Pp"),
    header: "Fecha",
    columnTitle: "Fecha",
    minSize: 250,
    enableSorting: true,
    filterVariant: "datetime-range",
  },
  {
    accessorKey: "severity",
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
    size: 120,
    enableSorting: true,
  },
  {
    accessorKey: "restart",
    accessorFn: (row) => row.restart,
    header: "Restart",
    columnTitle: "Restart",
    size: 120,
  },
  {
    accessorKey: "camera_missing",
    accessorFn: (row) => row.camera_connection,
    header: "Cámaras",
    columnTitle: "Cámaras",
    size: 120,
  },
  {
    accessorKey: "read_only_ssd",
    accessorFn: (row) => row.read_only_ssd,
    header: "Read only",
    columnTitle: "Read only SSD",
    size: 120,
  },
  {
    accessorKey: "forced_reboot",
    accessorFn: (row) => row.forced_reboot,
    header: "Forced reboot",
    columnTitle: "Forced reboot",
    size: 120,
  },
  {
    accessorKey: "start",
    accessorFn: (row) => row.start,
    header: "Start",
    columnTitle: "Start",
    size: 120,
  },
  {
    accessorKey: "reboot",
    accessorFn: (row) => row.reboot,
    header: "Reboot",
    columnTitle: "Reboot",
    size: 120,
  },
  {
    accessorKey: "data_validation",
    accessorFn: (row) => row.reboot,
    header: "Data Val",
    columnTitle: "Data Val",
    size: 120,
  },
  {
    accessorKey: "source_missing",
    accessorFn: (row) => row.source_missing,
    header: "SourceID",
    columnTitle: "SourceID",
    size: 120,
  },
  {
    accessorKey: "storage_devices",
    accessorFn: (row) => row.storage_devices,
    header: "Memory",
    columnTitle: "Memory",
    size: 120,
  },
  {
    accessorKey: "others",
    accessorFn: (row) => row.others,
    header: "Others",
    columnTitle: "Others",
    size: 120,
  },
];

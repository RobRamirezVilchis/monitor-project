"use client";

import {
  useDeviceHistoryQuery,
  useDeviceStatusQuery,
  useUnitHistoryQuery,
} from "@/api/queries/monitor";
import {
  Device,
  DeviceHistory,
  Unit,
  UnitHistory,
} from "@/api/services/monitor/types";
import { withAuth } from "@/components/auth/withAuth";
import { useDataGrid, useSsrDataGrid } from "@/hooks/data-grid";
import DataGrid from "@/ui/data-grid/DataGrid";
import { ColumnDef } from "@/ui/data-grid/types";
import { format, lightFormat, parseISO } from "date-fns";

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

const DevicePage = ({ params }: { params: { device_id: string } }) => {
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

  const deviceStatusQuery = useDeviceStatusQuery({
    variables: {
      device_id: params.device_id,
    },
  });

  const deviceStatus = deviceStatusQuery.data;

  const history_query = useDeviceHistoryQuery({
    variables: {
      device_id: params.device_id,
      page: queryVariables.page,
      page_size: queryVariables.page_size,
    },
  });

  const last_log: DeviceHistory | undefined = history_query.data?.data[0];

  const severity = last_log?.severity;
  const color = statusColors[severity as StatusKey];

  const grid = useDataGrid<DeviceHistory>({
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

    ...(dataGridConfig as any),
    pageCount: history_query.data?.pagination?.pages ?? 0,
    rowCount: history_query.data?.pagination?.count ?? 0,
  });

  return (
    <section className="flex flex-col h-full lg:container mx-auto pb-2 md:pb-6">
      <div className="flex mt-10 mb-4 justify-between items-center">
        <div className="flex  justify-start gap-4">
          <h1 className="text-5xl font-bold">{deviceStatus?.device}</h1>
          <div
            className={`inline-flex px-4 pt-1 pb-0.5 text-3xl font-semibold 
                    border-2 ${color} rounded-full items-center`}
          >
            {statusNames[severity as StatusKey]}
          </div>
        </div>
      </div>

      {deviceStatus && (
        <div>
          {deviceStatus.delayed && (
            <div className="flex items-center text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>

              <p className="ml-2 text-2xl">
                Retraso: {deviceStatus.delay_time}
              </p>
            </div>
          )}
          {!deviceStatus.delayed && (
            <div className="flex items-center text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2.5"
                stroke="currentColor"
                class="w-6 h-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>

              <p className="ml-2 mt-1 text-2xl">Comunicación reciente</p>
            </div>
          )}
          <div>
            {deviceStatus.last_connection && (
              <p className="text-2xl text-gray-500">
                Última conexión:{" "}
                {format(parseISO(deviceStatus.last_connection), "Pp")}
              </p>
            )}
            {!deviceStatus.last_connection && (
              <p className="text-2xl text-gray-500">
                Última conexión desconocida
              </p>
            )}
          </div>
        </div>
      )}

      <DataGrid instance={grid} />
    </section>
  );
};

//export default UnitPage;
export default withAuth(DevicePage, {
  rolesWhitelist: ["Admin"],
});

const cols: ColumnDef<DeviceHistory>[] = [
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
    accessorKey: "delayed",
    accessorFn: (row) => row.delayed,
    header: "Retraso",
    columnTitle: "Retraso",
    size: 100,
  },
  {
    accessorKey: "delay_time",
    accessorFn: (row) => row.delay_time,
    header: "Tiempo retraso",
    columnTitle: "Tiempo retraso",
    size: 100,
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
    accessorKey: "license",
    accessorFn: (row) => row.license,
    header: "License",
    columnTitle: "License",
    size: 100,
  },
  {
    accessorKey: "shift_change",
    accessorFn: (row) => row.shift_change,
    header: "Turno",
    columnTitle: "Turno",
    size: 100,
  },
  {
    accessorKey: "others",
    accessorFn: (row) => row.others,
    header: "Otros",
    columnTitle: "Otros",
    size: 100,
  },
];

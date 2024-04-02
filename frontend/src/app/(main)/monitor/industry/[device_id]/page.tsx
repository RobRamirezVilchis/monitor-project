"use client";

import {
  useCameraDisconnectionsQuery,
  useDeviceHistoryQuery,
  useDeviceLastStatusChange,
  useDeviceStatusQuery,
  useUnitHistoryQuery,
} from "@/api/queries/monitor";
import {
  CameraDisconnection,
  Device,
  DeviceHistory,
  Unit,
  UnitHistory,
} from "@/api/services/monitor/types";

import { useDataGrid, useSsrDataGrid } from "@/hooks/data-grid";
import DataGrid from "@/ui/data-grid/DataGrid";
import { ColumnDef } from "@/ui/data-grid/types";

import {
  format,
  formatDistanceToNow,
  parseISO,
  differenceInDays,
} from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

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

const DevicePage = ({ params }: { params: { device_id: string } }) => {
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

  const deviceStatusQuery = useDeviceStatusQuery({
    variables: {
      device_id: params.device_id,
    },
  });

  const deviceStatus = deviceStatusQuery.data;
  const severity = deviceStatus?.severity;
  const color = statusStyles[severity as StatusKey];

  const historyQuery = useDeviceHistoryQuery({
    variables: {
      device_id: params.device_id,
      ...queryVariables,
    },
  });

  const disconnectionsQuery = useCameraDisconnectionsQuery({
    variables: {
      device_id: params.device_id,
      ...queryVariables,
    },
  });

  let daysRemaining: number = -1;
  if (deviceStatus?.license_end) {
    daysRemaining = differenceInDays(deviceStatus.license_end, Date());
  }

  const deviceLastStatusChange = useDeviceLastStatusChange({
    variables: {
      device_id: params.device_id,
    },
  });

  let timeAgo: string;
  if (deviceLastStatusChange.data != null) {
    timeAgo = formatDistanceToNow(
      deviceLastStatusChange.data?.register_datetime,
      {
        addSuffix: true,
        locale: es,
      }
    );
  } else {
    timeAgo = "-";
  }

  const grid = useDataGrid<DeviceHistory>({
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

  const camerasGrid = useDataGrid<CameraDisconnection>({
    data: disconnectionsQuery.data?.data || [],
    columns: cameraGridCols,
    rowNumberingMode: "static",
    enableRowNumbering: true,
    disableCellSelectionOnClick: true,
    initialState: {
      density: "compact",
    },
    state: {
      loading: disconnectionsQuery.isLoading || disconnectionsQuery.isFetching,
      ...dataGridState,
    },
    enableColumnResizing: true,
    hideColumnFooters: true,
    enableColumnActions: true,

    ...(dataGridConfig as any),
    pageCount: disconnectionsQuery.data?.pagination?.pages ?? 0,
    rowCount: disconnectionsQuery.data?.pagination?.count ?? 0,
  });

  return (
    <section className="relative">
      <Link href={"./"} className="absolute right-full mr-5 mt-2 opacity-40">
        <ArrowBackIcon />
      </Link>
      <div className="flex mb-4 justify-between items-center">
        <div className="xl:flex xl:gap-6">
          <h1 className="text-5xl font-bold">{deviceStatus?.device}</h1>
          <div className="md:flex justify-start items-center gap-4 mt-4 xl:mt-0">
            <div
              className={`inline-flex h-fit px-4 pt-1 pb-0.5 text-3xl font-semibold mb-2 md:mb-0
              border-2 ${color} rounded-full items-center`}
            >
              {statusNames[severity as StatusKey]}
            </div>
            <div className="flex gap-3 text-xl text-gray-500 items-center">
              <div className="shrink">{deviceStatus?.description}</div>
              <div>|</div>
              <div>Desde {timeAgo}</div>
            </div>{" "}
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
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
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
                strokeWidth="2.5"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>

              <p className="ml-2 mt-1 text-2xl">Comunicación reciente</p>
            </div>
          )}
          <div>
            {daysRemaining != -1 && (
              <p className="text-2xl text-gray-500">
                Licencia termina en {daysRemaining} días
              </p>
            )}
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

      <div className="h-[70vh]">
        <DataGrid instance={grid} />
      </div>
      <h3 className="text-2xl opacity-60 mt-10">Desconexiones de cámaras:</h3>
      <div className="h-[70vh]">
        <DataGrid instance={camerasGrid} />
      </div>
    </section>
  );
};

//export default UnitPage;
export default DevicePage;

const cols: ColumnDef<DeviceHistory>[] = [
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
    accessorKey: "last_connection",
    accessorFn: (row) =>
      row.last_connection
        ? format(parseISO(row.last_connection), "Pp")
        : "Desconocida",
    header: "Última conexión",
    columnTitle: "Última conexión",
    minSize: 200,
    enableSorting: true,
    filterVariant: "datetime-range",
  },
  {
    accessorKey: "severity",
    accessorFn: (row) => statusNames[row.severity as StatusKey],
    header: "Estátus",
    columnTitle: "Estátus",
    size: 120,
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
    size: 120,
    enableSorting: true,
  },
  {
    accessorKey: "delay_time",
    accessorFn: (row) => row.delay_time,
    header: "Tiempo retraso",
    columnTitle: "Tiempo retraso",
    size: 170,
    enableSorting: true,
  },
  {
    accessorKey: "restart",
    accessorFn: (row) => row.restart,
    header: "Restart",
    columnTitle: "Restart",
    size: 120,
    enableSorting: true,
  },
  {
    accessorKey: "camera_connection",
    accessorFn: (row) => row.camera_connection,
    header: "Desconexión de cámaras",
    columnTitle: "Desconexión de cámaras",
    size: 150,
    enableSorting: true,
  },
  {
    accessorKey: "license",
    accessorFn: (row) => row.license,
    header: "License",
    columnTitle: "License",
    size: 110,
    enableSorting: true,
  },
  {
    accessorKey: "shift_change",
    accessorFn: (row) => row.shift_change,
    header: "Turno",
    columnTitle: "Turno",
    size: 100,
    enableSorting: true,
  },
  {
    accessorKey: "others",
    accessorFn: (row) => row.others,
    header: "Otros",
    columnTitle: "Otros",
    size: 100,
    enableSorting: true,
  },
];

const cameraGridCols: ColumnDef<CameraDisconnection>[] = [
  {
    accessorKey: "register_datetime",
    accessorFn: (row) => format(parseISO(row.register_datetime), "Pp"),
    header: "Fecha",
    columnTitle: "Fecha",
    minSize: 350,
    enableSorting: true,
    filterVariant: "datetime-range",
  },
  {
    accessorKey: "camera",
    accessorFn: (row) => row.camera,
    header: "Cámara",
    columnTitle: "Cámara",
    minSize: 200,
    enableSorting: true,
    //filterVariant: "datetime-range",
  },

  {
    accessorKey: "disconnection_time",
    accessorFn: (row) => row.disconnection_time,
    header: "Tiempo de desconexión",
    columnTitle: "Desconexión",
    size: 250,
    enableSorting: true,
  },
];

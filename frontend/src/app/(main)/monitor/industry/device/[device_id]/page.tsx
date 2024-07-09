"use client";

import {
  useCameraDisconnectionsQuery,
  useDeviceHistoryQuery,
  useDeviceLastStatusChange,
  useDeviceSeverityHistory,
  useDeviceStatusQuery,
  useCheckDeviceWifiQuery as useDeviceWifiQuery,
} from "@/api/queries/monitor";
import {
  CameraDisconnection,
  DeviceFilters,
  DeviceHistory,
} from "@/api/services/monitor/types";

import { useDataGrid, useSsrDataGrid } from "@/hooks/data-grid";
import DataGrid from "@/ui/data-grid/DataGrid";
import { ColumnDef } from "@/ui/data-grid/types";

import { useSetDeviceInactiveMutation } from "@/api/mutations/monitor";
import wifiError from "@/media/error-de-conexion.png";
import { Button, Modal } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import {
  differenceInDays,
  format,
  formatDistanceToNow,
  parseISO,
} from "date-fns";
import { es } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import BackArrow from "../../../(components)/BackArrow";
import {
  StatusKey,
  dotColors,
  statusNames,
  statusStyles,
} from "../../../(components)/colors";

const DevicePage = ({ params }: { params: { device_id: string } }) => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [opened, { open, close }] = useDisclosure(false);

  const currentDate = new Date();
  let yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const [dateValue, setDateValue] = useState<[Date | null, Date | null]>([
    yesterday,
    currentDate,
  ]);

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

  const checkWifiQuery = useDeviceWifiQuery({
    variables: {
      device_id: params.device_id,
    },
  });
  const hasWifiProblems = checkWifiQuery.data?.connection_problems;

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
    enableMultiSort: true,
    enableColumnResizing: true,
    hideColumnFooters: true,
    enableColumnActions: true,

    ...(dataGridConfig as any),
    pageCount: disconnectionsQuery.data?.pagination?.pages ?? 0,
    rowCount: disconnectionsQuery.data?.pagination?.count ?? 0,
  });

  const deviceSeverityHistory = useDeviceSeverityHistory({
    variables: {
      device_id: params.device_id,
      register_datetime_after: dateValue[0],
      register_datetime_before: dateValue[1],
    },
  });

  const plotData = deviceSeverityHistory.data;

  const setUnitInactiveMutation = useSetDeviceInactiveMutation({
    onSuccess: () => {
      router.push("/monitor/industry/");
    },
    onError: (error: any, variables, context) => {
      setError(error.response.data["error"]);
    },
  });

  const onConfirmation = async (deviceFilters: DeviceFilters) => {
    setUnitInactiveMutation.mutate(deviceFilters);
  };

  return (
    <section className="relative mb-20">
      <BackArrow />
      <div className="flex mb-4 justify-between items-center">
        <div className="xl:flex gap-6 items-center">
          <div className="md:flex gap-3 items-center">
            <h1 className="text-5xl font-bold">
              {deviceStatus?.device_description
                ? deviceStatus.device_description
                : deviceStatus?.device_name.replace("_", " ")}
            </h1>
            <h2 className=" bg-gray-600 text-white dark:text-white dark:bg-gray-700  w-fit h-fit py-1 px-2 rounded-lg text-2xl opacity-50 font-semibold">
              {deviceStatus?.client}
            </h2>
          </div>
          <div className="md:flex justify-start items-center gap-4 mt-4 xl:mt-0">
            <div
              className={`inline-flex h-fit px-4 pt-1 pb-0.5 text-2xl font-semibold mb-2 md:mb-0
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
        {hasWifiProblems && (
          <div className="hidden md:flex items-center gap-2 opacity-70 text-lg px-2 py-1 bg-gray-300 rounded-md  dark:text-black">
            <Image src={wifiError} width={30} alt={""}></Image>
            <p>Problemas de conexión</p>
          </div>
        )}
      </div>

      <div className="sm:flex justify-between items-end">
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
        <div className="mt-2 sm:mt-0">
          <Link href={`${params.device_id}/logs`}>
            <Button size="md">Consultar logs</Button>
          </Link>
        </div>
      </div>

      <div className="h-[70vh] mb-10">
        <DataGrid instance={grid} />
      </div>
      <h3 className="text-2xl opacity-60">Desconexiones de cámaras:</h3>
      <div className="h-[70vh]">
        <DataGrid instance={camerasGrid} />
      </div>

      <div className=" items-center gap-8 mb-6 mt-8">
        <p className="text-2xl opacity-60 mb-2">Gráfica de estátus </p>
        <div className="flex items-center">
          <p className="hidden sm:block mr-2">Rango de fechas:</p>
          <div className="w-80 mt-1 sm:mt-0">
            <DatePickerInput
              type="range"
              placeholder="Pick date"
              value={dateValue}
              onChange={setDateValue}
            />
          </div>
        </div>
      </div>
      {plotData && plotData.length > 0 && (
        <ResponsiveContainer width="100%" height={500}>
          <ScatterChart
            width={730}
            height={250}
            margin={{
              top: 20,
              right: 20,
              bottom: 120,
            }}
          >
            <CartesianGrid strokeDasharray={"3 3"} />
            <XAxis dataKey="hora" />
            <YAxis
              type="number"
              dataKey="severidad"
              domain={[0, "dataMax"]}
              interval={0}
              ticks={[0, 1, 2, 3, 4, 5]}
            />
            <ZAxis dataKey="descripcion" />

            <Tooltip content={<CustomTooltip />} />
            <Scatter data={plotData} dataKey="severidad" fill="#8884d8">
              {plotData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={dotColors[entry.severidad as StatusKey]}
                ></Cell>
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      )}
      <Button onClick={open} color="red.9" size="md">
        Detener monitoreo
      </Button>
      <Modal opened={opened} onClose={close} title="¿Estás seguro?" centered>
        <p className="mb-4 text-lg">
          Este dispositivo ya no aparecerá en la plataforma, ni se buscará
          información de él.
        </p>
        <Button
          color="red.9"
          onClick={() => onConfirmation({ device_id: params.device_id })}
        >
          Sí
        </Button>
      </Modal>
    </section>
  );
};

//export default UnitPage;
export default DevicePage;

const ConvertBool = (condition: boolean) => (condition ? "Sí" : "No");

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip bg-white dark:bg-gray-800 p-4 border-2 rounded-lg">
        <p className="label">{`Hora: ${payload[0].value}`}</p>
        <p className="label">{`Estátus: ${
          statusNames[Number(payload[1].value) as StatusKey]
        }`}</p>
        <p className="label">{payload[2].value}</p>
      </div>
    );
  }

  return null;
};

const cols: ColumnDef<DeviceHistory>[] = [
  {
    accessorKey: "register_datetime",
    accessorFn: (row) => format(parseISO(row.register_datetime), "Pp"),
    header: "Fecha",
    columnTitle: "Fecha",
    columnTitleCustom:
      "Fecha y hora de registro, cada uno considera logs en un intervalo de 10 minutos hacia atrás",
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
    columnTitle: "Descripción de estátus",
    size: 250,
    enableSorting: true,
  },
  {
    accessorKey: "delayed",
    accessorFn: (row) => ConvertBool(row.delayed),
    header: "Retraso",
    columnTitle:
      "Está en retraso cuando transcurren 10 minutos sin que llegue ningún log",
    size: 120,
    enableSorting: true,
  },
  {
    accessorKey: "delay_time",
    accessorFn: (row) => row.delay_time,
    header: "Tiempo retraso",
    columnTitle:
      "Tiempo transcurrido sin recibir ningún log, pasando 10 minutos",
    size: 170,
    enableSorting: true,
  },
  {
    accessorKey: "camera_connection",
    accessorFn: (row) => row.camera_connection,
    header: "Desconexión de cámaras",
    columnTitle:
      "Tiempo acumulado de desconexión de todas las cámaras en intervalo de 10 minutos",
    size: 150,
    enableSorting: true,
  },
  {
    accessorKey: "restart",
    accessorFn: (row) => row.restart,
    header: "Restart",
    columnTitle: "Restart",
    columnTitleCustom: "Cantidad de logs recibidos de reinicios de pipeline",
    size: 120,
    enableSorting: true,
  },

  {
    accessorKey: "license",
    accessorFn: (row) => row.license,
    header: "License",
    columnTitle: "License",
    columnTitleCustom: "Cantidad de logs recibidos de licencia",
    size: 110,
    enableSorting: true,
  },
  {
    accessorKey: "shift_change",
    accessorFn: (row) => row.shift_change,
    header: "Turno",
    columnTitle: "Turno",
    columnTitleCustom: "Cantidad de logs recibidos de cambio de turno",
    size: 100,
    enableSorting: true,
  },
  {
    accessorKey: "others",
    accessorFn: (row) => row.others,
    header: "Otros",
    columnTitle: "Otros",
    columnTitleCustom: "Cantidad de logs recibidos de otros casos",
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

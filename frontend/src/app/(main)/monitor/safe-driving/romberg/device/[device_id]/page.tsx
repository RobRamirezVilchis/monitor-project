"use client";

import {
  useCheckDeviceWifiQuery as useDeviceWifiQuery,
  useGxMetricThresholdsQuery,
  useGxRecordsQuery,
  useRombergDeviceHistoryQuery,
  useRombergDeviceLastStatusChange,
  useRombergDeviceSeverityHistory,
  useRombergDeviceStatusQuery,
} from "@/api/queries/monitor";
import {
  DeviceFilters,
  GxRecord,
  RombergDeviceHistory,
} from "@/api/services/monitor/types";

import { useDataGrid, useSsrDataGrid } from "@/hooks/data-grid";
import DataGrid from "@/ui/data-grid/DataGrid";
import { ColumnDef } from "@/ui/data-grid/types";

import { useSetDeviceInactiveMutation } from "@/api/mutations/monitor";
import wifiError from "@/media/error-de-conexion.png";
import {
  Button,
  Drawer,
  Modal,
  SegmentedControl,
  Skeleton,
} from "@mantine/core";
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
import Breadcrumbs from "../../../../(components)/Breadcrumbs";
import {
  StatusKey,
  dotColors,
  statusNames,
  statusStyles,
} from "../../../../(components)/colors";
import { ChartTooltipProps, LineChart } from "@mantine/charts";
import { PaymentOutlined } from "@mui/icons-material";

const RombergDevicePage = ({ params }: { params: { device_id: string } }) => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [opened, { open, close }] = useDisclosure(false);
  const [drawerOpened, { open: drawerOpen, close: drawerClose }] =
    useDisclosure(false);
  const [selectedMetric, setSelectedMetric] = useState("RAM");

  const currentDate = new Date();
  let yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const [dateValue, setDateValue] = useState<[Date | null, Date | null]>([
    yesterday,
    currentDate,
  ]);

  const [recordsDateValue, setRecordsDateValue] = useState<
    [Date | null, Date | null]
  >([yesterday, currentDate]);

  const deviceStatusQuery = useRombergDeviceStatusQuery({
    variables: {
      device_id: params.device_id,
    },
  });

  const deviceStatus = deviceStatusQuery.data;
  const severity = deviceStatus?.severity;
  const color = statusStyles[severity as StatusKey];

  /*  const disconnectionsQuery = useCameraDisconnectionsQuery({
    variables: {
      device_id: params.device_id,
      ...queryVariables,
    },
  }); */

  let daysRemaining: number = -1;
  if (deviceStatus?.license_end) {
    daysRemaining = differenceInDays(deviceStatus.license_end, Date());
  }

  const deviceLastStatusChange = useRombergDeviceLastStatusChange({
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
  const historyQuery = useRombergDeviceHistoryQuery({
    variables: {
      device_id: params.device_id,
      ...queryVariables,
    },
  });
  const grid = useDataGrid<RombergDeviceHistory>({
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

  /* const camerasGrid = useDataGrid<CameraDisconnection>({
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
 */
  const deviceSeverityHistory = useRombergDeviceSeverityHistory({
    variables: {
      device_id: params.device_id,
      register_datetime_after: dateValue[0],
      register_datetime_before: dateValue[1],
    },
  });

  const plotData = deviceSeverityHistory.data;

  const {
    dataGridState: recordsDataGridState,
    queryVariables: recordsQueryVariables,
    dataGridConfig: recordsDataGridConfig,
  } = useSsrDataGrid<{
    name: string;
    register_time: [Date | null, Date | null];
  }>({
    defaultSorting: ["register_time"],
    queryStateOptions: {
      navigateOptions: {
        scroll: false,
      },
      history: "replace",
    },
    transform: {
      register_time: (key, value) => {
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
  const recordsQuery = useGxRecordsQuery({
    variables: {
      gx_id: Number(params.device_id),
      register_time_after: recordsDateValue[0],
      register_time_before: recordsDateValue[1],
      metric_name: selectedMetric,
    },
  });

  const recordsList = recordsQuery.data;
  console.log(recordsList);
  const recordsGrid = useDataGrid<GxRecord>({
    data: recordsQuery.data || [],
    columns: recordsGridCols,
    rowNumberingMode: "static",
    enableRowNumbering: true,
    disableCellSelectionOnClick: true,
    initialState: {
      density: "compact",
    },
    state: {
      loading: recordsQuery.isLoading || recordsQuery.isFetching,
      ...dataGridState,
    },
    enableMultiSort: true,
    enableColumnResizing: true,
    hideColumnFooters: true,
    enableColumnActions: true,

    ...(dataGridConfig as any),
    /* pageCount: recordsQuery.data?.pagination?.pages ?? 0,
    rowCount: recordsQuery.data?.pagination?.count ?? 0, */
  });

  let records: { name: string; value: number; critical: boolean }[] = [];
  for (const metricName in deviceStatus?.records) {
    records.push({ ...deviceStatus.records[metricName], name: metricName });
  }

  const thresholdsQuery = useGxMetricThresholdsQuery({
    variables: { gx_id: Number(params.device_id) },
  });

  const threshold = thresholdsQuery?.data?.find(
    (th) => th.metric_name == selectedMetric
  );

  const setUnitInactiveMutation = useSetDeviceInactiveMutation({
    onSuccess: () => {
      router.push("/monitor/smart-retail/");
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
      <Drawer
        opened={drawerOpened}
        onClose={drawerClose}
        title="Métricas"
        size={"xl"}
        position="right"
        classNames={{ title: "text-xl font-semibold" }}
      >
        <div className="flex flex-col gap-6 px-6">
          <div className="sm:flex w-96 gap-2 items-center mt-1 sm:mt-0">
            <p>Rango de tiempo:</p>
            <DatePickerInput
              type="range"
              placeholder="Pick date"
              value={recordsDateValue}
              onChange={setRecordsDateValue}
            />
          </div>
          <SegmentedControl
            value={selectedMetric}
            onChange={setSelectedMetric}
            data={records.map((r) => r.name)}
          ></SegmentedControl>
          <Skeleton visible={recordsList == undefined}>
            <LineChart
              tooltipProps={{
                content: ({ label, payload }) => (
                  <LineTooltip label={label} payload={payload} />
                ),
              }}
              h={250}
              data={recordsList as Record<string, any>[]}
              dataKey="register_time"
              series={[{ name: "avg_value", color: "green.6" }]}
              curveType="linear"
              withDots={false}
              referenceLines={
                threshold
                  ? [
                      {
                        y: threshold.threshold,
                        label: "Crítico",
                        color: "red.6",
                      },
                    ]
                  : []
              }
            ></LineChart>
          </Skeleton>

          <DataGrid instance={recordsGrid}></DataGrid>
        </div>
      </Drawer>
      {/*  <BackArrow /> */}
      <div className="flex mb-4 justify-between items-center">
        <div className="xl:flex xl:gap-6">
          <div className="md:flex gap-3 ">
            {deviceStatus && (
              <Breadcrumbs
                links={[
                  {
                    href: "/monitor/safe-driving/romberg/details/",
                    name: "Romberg",
                  },
                ]}
                pageName={deviceStatus?.device_description}
              ></Breadcrumbs>
            )}

            <h2
              className=" bg-gray-600 text-white dark:text-white dark:bg-dark-400 mt-3 
            md:mt-0 w-fit h-fit py-1 px-2 rounded-lg text-2xl opacity-50 font-semibold"
            >
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
            <div className="flex gap-3 text-xl text-neutral-500 dark:text-dark-200 items-center">
              <div className="shrink">{deviceStatus?.description}</div>
              <div>|</div>
              <div>Desde {timeAgo}</div>
            </div>{" "}
          </div>
        </div>
        {hasWifiProblems && (
          <div
            className="hidden md:flex items-center gap-2 opacity-70 text-lg 
          px-2 py-1 bg-gray-300 rounded-md  dark:text-black"
          >
            <Image src={wifiError} width={30} alt={""}></Image>
            <p>Problemas de conexión</p>
          </div>
        )}
      </div>
      <div className="flex gap-3 mb-2">
        {records.map((rec, i) => (
          <div
            key={i}
            className={` border-1   py-1.5 px-2 rounded-lg
              ${
                rec.critical
                  ? `bg-red-200 text-red-700 border-red-400`
                  : `bg-gray-200 text-neutral-600 border-neutral-300`
              }
            `}
          >
            <span className="mr-1">{rec.name}</span>
            <span>-</span>
            {!rec.name.endsWith("TEMP") ? (
              <span className="p-1">{(rec.value * 100).toFixed(2)}%</span>
            ) : (
              <span className="p-1">{rec.value.toFixed(2)}</span>
            )}
          </div>
        ))}
        <Button variant="outline" color="green.7" onClick={drawerOpen}>
          Ver métricas
        </Button>
      </div>

      <div className="sm:flex justify-between items-end text-xl">
        {deviceStatus && (
          <div className="text-neutral-500 dark:text-dark-200">
            {deviceStatus.delayed && (
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                  />
                </svg>

                <p className="ml-2 ">Retraso: {deviceStatus.delay_time}</p>
              </div>
            )}
            {!deviceStatus.delayed && (
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                  strokeWidth="2.5"
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 12.75 6 6 9-13.5"
                  />
                </svg>

                <p className="ml-2 mt-1 ">Comunicación reciente</p>
              </div>
            )}
            <div>
              {daysRemaining != -1 && (
                <p>Licencia termina en {daysRemaining} días</p>
              )}
              {deviceStatus.last_activity && (
                <p>
                  Última conexión:{" "}
                  {format(parseISO(deviceStatus.last_activity), "Pp")}
                </p>
              )}
              {!deviceStatus.last_activity && (
                <p>Última conexión desconocida</p>
              )}
            </div>
          </div>
        )}
        {/* <div className="mt-2 sm:mt-0">
          <Link href={`${params.device_id}/logs`}>
            <Button size="md">Consultar logs</Button>
          </Link>
        </div> */}
      </div>

      <div className="mt-4 mb-20">
        <p className="text-2xl text-neutral-500 dark:text-dark-200">
          Estatus cada diez minutos
        </p>
        <div className="h-[65vh] ">
          <DataGrid instance={grid} />
        </div>
      </div>

      {/* <div>
        <h3 className="text-2xl opacity-60">Desconexiones de cámaras:</h3>
        <div className="h-[70vh]">
          <DataGrid instance={camerasGrid} />
        </div>
      </div> */}

      <div className=" items-center gap-8 mb-6 mt-8">
        <p className="text-2xl text-neutral-500 dark:text-dark-200 mb-2">
          Gráfica de estatus{" "}
        </p>
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
      {plotData && (
        <ResponsiveContainer width="100%" height={500}>
          <ScatterChart
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
export default RombergDevicePage;

const ConvertBool = (condition: boolean) => (condition ? "Sí" : "No");

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip bg-white dark:bg-dark-500 p-4 rounded-md shadow-md">
        <p className="label">{`Hora: ${payload[0].value}`}</p>
        <p className="label">{`Estatus: ${
          statusNames[Number(payload[1].value) as StatusKey]
        }`}</p>
        <p className="label">{payload[2].value}</p>
      </div>
    );
  }

  return null;
};

function LineTooltip({ label, payload }: ChartTooltipProps) {
  if (!payload) return null;
  let metric_date, metric_value, metric_name;
  if (payload.length) {
    metric_date = format(parseISO(payload[0].payload.register_time), "Pp");
    metric_value = payload[0].payload.avg_value.toFixed(4);
    if (!payload[0].payload.metric.endsWith("TEMP")) {
      metric_value = (payload[0].payload.avg_value * 100).toFixed(2) + " %";
    }
  }

  return (
    <div>
      {payload.length && (
        <div className="bg-white dark:bg-dark-500 p-4 rounded-md shadow-md">
          <p className="font-bold">{metric_date}</p>
          <span>{metric_value}</span>
        </div>
      )}
    </div>
  );
}

const cols: ColumnDef<RombergDeviceHistory>[] = [
  {
    accessorKey: "register_datetime",
    accessorFn: (row) =>
      row.register_datetime
        ? format(parseISO(row.register_datetime), "Pp")
        : "-",
    header: "Fecha",
    columnTitle: "Fecha",
    columnTitleCustom:
      "Fecha y hora de registro, cada uno considera logs en un intervalo de 10 minutos hacia atrás",
    minSize: 250,
    enableSorting: true,
    filterVariant: "datetime-range",
  },
  {
    accessorKey: "last_activity",
    accessorFn: (row) =>
      row.last_activity
        ? format(parseISO(row.last_activity), "Pp")
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
    header: "Estatus",
    columnTitle: "Estatus",
    size: 120,
    enableSorting: true,
  },
  {
    accessorKey: "description",
    accessorFn: (row) => row.description,
    header: "Descripción",
    columnTitle: "Descripción de estatus",
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
    accessorKey: "log_counts",
    accessorFn: (row) =>
      JSON.stringify(row.log_counts).slice(1, -1).replaceAll('"', ""),
    header: "Logs recibidos",
    columnTitle:
      "Cantidad de logs recibidos de cada categoría (no aplican logs vacíos)",
    size: 400,
    enableSorting: true,
  },
];

const recordsGridCols: ColumnDef<GxRecord>[] = [
  /* {
    accessorKey: "register_time",
    accessorFn: (row) => format(parseISO(row.register_time), "Pp"),
    header: "Fecha de subida",
    columnTitle: "Fecha de subida",
    minSize: 350,
    enableSorting: true,
    filterVariant: "datetime-range",
  }, */
  {
    accessorKey: "log_time",
    accessorFn: (row) => format(parseISO(row.register_time), "Pp"),
    header: "Fecha de log",
    columnTitle: "Fecha de log",
    minSize: 250,
    enableSorting: true,
    filterVariant: "datetime-range",
  },
  {
    accessorKey: "critical",
    accessorFn: (row) => (row.critical ? "Sí" : "No"),
    header: "Crítico",
    columnTitle: "Crítico",
    minSize: 70,
    enableSorting: true,
  },

  {
    accessorKey: "avg_value",
    accessorFn: (row) => row.avg_value.toFixed(4),
    header: "Promedio",
    columnTitle: "Promedio",
    size: 150,
    enableSorting: true,
  },
  {
    accessorKey: "max_value",
    accessorFn: (row) => row.max_value,
    header: "Máximo",
    columnTitle: "Máximo",
    size: 150,
    enableSorting: true,
  },
  {
    accessorKey: "min_value",
    accessorFn: (row) => row.min_value,
    header: "Mínimo",
    columnTitle: "Mínimo",
    size: 150,
    enableSorting: true,
  },
];

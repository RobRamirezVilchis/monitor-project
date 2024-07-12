"use client";

import {
  useUnitFailedTripsQuery,
  useUnitHistoryQuery,
  useUnitLastActiveStatus,
  useUnitLastStatusChange,
  useUnitReportQuery,
  useUnitSeverityHistory,
  useUnitStatusQuery,
  useUnitTripsQuery,
} from "@/api/queries/monitor";
import { Unit, UnitFilters, UnitHistory } from "@/api/services/monitor/types";

import { useDataGrid, useSsrDataGrid } from "@/hooks/data-grid";
import DataGrid from "@/ui/data-grid/DataGrid";
import { ColumnDef } from "@/ui/data-grid/types";

import { format, formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";
//import { BarChart } from "@mantine/charts";
import {
  CartesianGrid,
  Cell,
  ReferenceArea,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
// for recharts v2.1 and above

import { useSetUnitInactiveMutation } from "@/api/mutations/monitor";
import { Button, Modal } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import BackArrow from "../../../(components)/BackArrow";
import {
  StatusKey,
  dotColors,
  statusNames,
  statusStyles,
} from "../../../(components)/colors";
import Breadcrumbs from "../../../(components)/Breadcrumbs";

const DownloadFile = (unitData: { unitId: string; unitName: string }) => {
  const reportQuery = useUnitReportQuery({
    variables: { unit_id: unitData.unitId },
  });

  let reportContent = "";
  if (reportQuery.data) {
    reportContent = reportQuery.data.content;
  }
  const handleDownload = () => {
    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${unitData.unitName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Button color="green.7" size="md" onClick={handleDownload}>
      Descargar reporte
    </Button>
  );
};

const UnitPage = ({ params }: { params: { unit_id: string } }) => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [opened, { open, close }] = useDisclosure(false);
  const [elementWidth, setElementWidth] = useState(1000);
  const elementRef = useRef<HTMLDivElement>(null);

  const unit: Unit = {
    name: params.unit_id,
  };

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

  const unitStatusQuery = useUnitStatusQuery({
    variables: {
      unit_id: params.unit_id,
    },
  });

  const unitStatus = unitStatusQuery.data;
  const inactive =
    unitStatus?.description == "Inactivo" ||
    unitStatus?.description?.startsWith("Logs pendientes") ||
    unitStatus?.description?.startsWith("Sin comunicación");

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

  const unitLastActiveStatus = useUnitLastActiveStatus({
    variables: {
      unit_id: params.unit_id,
    },
  });

  const failedTrips = useUnitFailedTripsQuery({
    variables: {
      unit_id: params.unit_id,
    },
  }).data?.trips;

  const unitSeverityHistory = useUnitSeverityHistory({
    variables: {
      unit_id: params.unit_id,
      register_datetime_after: dateValue[0],
      register_datetime_before: dateValue[1],
    },
  });

  const plotData = unitSeverityHistory.data;

  const unitTrips = useUnitTripsQuery({
    variables: {
      unit_id: params.unit_id,
      register_datetime_after: dateValue[0],
      register_datetime_before: dateValue[1],
    },
  }).data;

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

  const setUnitInactiveMutation = useSetUnitInactiveMutation({
    onSuccess: () => {
      router.push("/monitor/safe-driving/");
    },
    onError: (error: any, variables, context) => {
      setError(error.response.data["error"]);
    },
  });

  const onConfirmation = async (unitFilters: UnitFilters) => {
    setUnitInactiveMutation.mutate(unitFilters);
  };

  let statusDescription: string | undefined | null;
  if (unitStatus?.description == "Sin comunicación (>2 viajes)") {
    statusDescription = `${failedTrips} viajes sin conexión`;
  } else {
    statusDescription = unitStatus?.description;
  }

  useEffect(() => {
    const updateWidth = () => {
      if (elementRef.current) {
        setElementWidth(elementRef.current.offsetWidth);
      }
    };

    // Update width on window resize
    window.addEventListener("resize", updateWidth);

    // Initial update
    updateWidth();

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  const numDataPoints = plotData ? plotData.length : 0;

  const tickLabelWidth = 20; // Approximate width of each tick label in pixels
  const maxTicks = Math.floor(elementWidth / tickLabelWidth);
  const interval = Math.max(1, Math.ceil(numDataPoints / maxTicks));

  return (
    <section className="relative mb-20">
      {/*  <BackArrow /> */}

      <div className="relative flex mb-6 justify-between items-center">
        <div className="xl:flex xl:gap-6 xl:items-center">
          {/* <h1 className="text-5xl font-bold">
            {unitStatus?.client == "Transpais" ? "Unidad" : ""}{" "}
            {unitStatus?.unit}
          </h1> */}
          {unitStatus && (
            <Breadcrumbs
              links={[
                {
                  href: "/monitor/safe-driving/details/",
                  name: "Safe Driving",
                },
              ]}
              pageName={`${unitStatus?.client == "Transpais" ? "Unidad" : ""} ${
                unitStatus?.unit
              }`}
            ></Breadcrumbs>
          )}

          <div className="md:flex justify-start items-center gap-4 mt-4 xl:mt-0">
            <div
              className={`inline-flex h-fit px-4 pt-1 pb-0.5 text-2xl font-semibold mb-2 md:mb-0
                    border-2 ${color} rounded-full items-center`}
            >
              {statusNames[severity as StatusKey]}
            </div>
            <div className="flex gap-3 text-xl text-neutral-500 dark:text-dark-200 items-center">
              <div className="shrink">{statusDescription}</div>
              <div className="border-r-2 border-neutral-400 dark:border-neutral-500 h-8" />
              <div>Desde {timeAgo}</div>
            </div>
          </div>
        </div>
        {unitStatus?.on_trip && (
          <div className="absolute right-4 bottom-3 md:static flex items-center top-0">
            <span className="relative h-3 w-3 mb-1">
              <span className="animate-ping h-4 w-4 absolute inline-flex rounded-full bg-sky-400 opacity-75"></span>
              <span className="absolute inline-flex rounded-full h-4 w-4 bg-sky-400"></span>
            </span>
            <div className="text-2xl font-semibold ml-6">En viaje</div>
          </div>
        )}
      </div>

      <div className="sm:flex justify-between items-end">
        <div className="flex flex-col xl:flex-row gap-3 items-start xl:items-center ">
          {unitStatus && (
            <div
              className="text-neutral-600 dark:text-dark-200 text-lg 
            bg-neutral-300 dark:bg-dark-600 px-3 py-1 rounded-md w-fit"
            >
              <p>Logs pendientes:</p>
              <div className="flex gap-2 items-center">
                {unitStatus.last_connection &&
                  (unitStatus.pending_events == 1 ? (
                    <p>{unitStatus.pending_events} evento</p>
                  ) : (
                    <p>{unitStatus.pending_events} eventos</p>
                  ))}
                <div className="border-r-2 border-gray-400 h-5" />
                {unitStatus.last_connection && (
                  <p>{unitStatus.pending_status} status</p>
                )}
              </div>
            </div>
          )}
          <div className="text-xl text-neutral-500 dark:text-dark-300">
            {inactive && unitLastActiveStatus.data && (
              <p>
                Último estatus activo:{" "}
                {statusNames[unitLastActiveStatus?.data.severity as StatusKey]}{" "}
                - {unitLastActiveStatus?.data.description}
              </p>
            )}
            {unitStatus && (
              <div>
                {unitStatus.last_connection && (
                  <p>
                    Última conexión:{" "}
                    {format(parseISO(unitStatus.last_connection), "Pp")}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex mt-2 sm:mt-0 gap-2">
          {unitStatus && (
            <DownloadFile unitName={unitStatus.unit} unitId={params.unit_id} />
          )}
          <Link href={`${params.unit_id}/logs`}>
            <Button size="md">Consultar logs</Button>
          </Link>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-2xl text-neutral-300 dark:text-dark-200">
          Estatus cada diez minutos
        </p>
        <div className="h-[65vh] mb-20">
          <DataGrid instance={grid} />
        </div>
      </div>

      <div className=" items-center gap-8 mb-6 mt-8">
        <p className="text-2xl text-neutral-300 dark:text-dark-200 mb-2">
          Gráfica de estatus{" "}
        </p>
        <div className="md:flex items-center gap-2">
          <p>Rango de fechas:</p>
          <div className="sm:w-80 mt-1 sm:mt-0">
            <DatePickerInput
              type="range"
              placeholder="Pick date"
              value={dateValue}
              onChange={setDateValue}
            />
          </div>
        </div>
      </div>
      {plotData && unitTrips && (
        <ResponsiveContainer ref={elementRef} width="100%" height={500}>
          <ScatterChart
            margin={{
              top: 20,
              right: 20,
              bottom: 120,
            }}
          >
            <CartesianGrid strokeDasharray={"3 3"} />
            <XAxis
              dataKey="hora"
              type="number"
              domain={["dataMin", "dataMax"]}
              scale={"time"}
              tickFormatter={(tick) => format(tick, "Pp")}
              /*  angle={-45}
              tickMargin={55} */
              interval={interval}
              tick={<CustomXAxisTick />}
            />
            <YAxis
              type="number"
              dataKey="severidad"
              domain={[0, "dataMax"]}
              interval={0}
              ticks={[0, 1, 2, 3, 4, 5]}
            />
            <ZAxis dataKey="descripcion" />
            {unitTrips.map((interval, index) => {
              return (
                <ReferenceArea
                  key={index}
                  x1={new Date(interval.start_datetime).getTime()}
                  x2={new Date(interval.end_datetime).getTime()}
                  strokeOpacity={0.3}
                  fill={interval.active ? "green" : "gray"}
                  fillOpacity={0.15}
                />
              );
            })}

            <Tooltip content={<CustomTooltip />} />
            <Scatter
              data={plotData.map((point) => ({
                ...point,
                hora: new Date(point.hora.slice(0, -1) + ":00:00").getTime(),
              }))}
              dataKey="severidad"
              fill="#8884d8"
            >
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

      <Button className="mt-6" onClick={open} color="red.9" size="md">
        Marcar como inactiva
      </Button>
      <Modal opened={opened} onClose={close} title="¿Estás seguro?" centered>
        <p className="mb-4 text-lg">
          La unidad ya no aparecerá en la plataforma, a menos que se reciba
          información de esta.
        </p>
        <Button
          color="red.9"
          onClick={() => onConfirmation({ unit_id: unit.name })}
        >
          Sí
        </Button>
      </Modal>
    </section>
  );
};

export default UnitPage;

const ConvertBool = (condition: boolean) => (condition ? "Sí" : "No");

type TooltipProps = {
  active?: boolean;
  payload?: { value: string }[];
  label?: string;
};

const CustomXAxisTick = (props: any) => {
  const { x, y, payload } = props;
  return (
    <g
      className="text-gray-500 dark:text-gray-200"
      transform={`translate(${x},${y})`}
    >
      <text
        x={0}
        y={0}
        dx={5}
        dy={20}
        className="text-gray-500 dark:text-gray-200 fill-current"
        textAnchor="end"
        transform="rotate(-45)"
      >
        {format(payload.value, "Pp")}
      </text>
    </g>
  );
};

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip bg-white dark:bg-gray-800 p-4 border-2 rounded-lg">
        {payload[0].value && (
          <p className="label">{`Hora: ${format(payload[0].value, "Pp")}`}</p>
        )}
        <p className="label">{`Estátus: ${
          statusNames[Number(payload[1].value) as StatusKey]
        }`}</p>
        {payload[1].value != "Inactivo" && (
          <p className="label">{payload[2].value}</p>
        )}
      </div>
    );
  }

  return null;
};

const cols: ColumnDef<UnitHistory>[] = [
  {
    accessorKey: "register_datetime",
    accessorFn: (row) => format(parseISO(row.register_datetime), "Pp"),
    header: "Fecha",
    columnTitle: "Fecha",
    columnTitleCustom:
      "Fecha y hora de registro, cada uno considera logs en un intervalo de 10 minutos hacia atrás",
    minSize: 250,
    //enableSorting: true,
    filterVariant: "datetime-range",
    enableMultiSort: true,
  },
  {
    accessorKey: "last_connection",
    accessorFn: (row) =>
      row.last_connection
        ? format(parseISO(row.last_connection), "Pp")
        : "Desconocida",
    header: "Última conexión",
    columnTitle: "Última conexión",
    columnTitleCustom: "Hora de última conexión",
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
    enableMultiSort: true,
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
    accessorFn: (row) => ConvertBool(row.on_trip),
    header: "En viaje",
    columnTitle: "En viaje",
    size: 100,
    enableSorting: true,
    filterVariant: "checkbox",
  },
  {
    accessorKey: "pending_events",
    accessorFn: (row) => row.pending_events,
    header: "Eventos pendientes",
    columnTitle: "Eventos pendientes por mandar",
    minSize: 30,
    enableSorting: true,
  },
  {
    accessorKey: "pending_status",
    accessorFn: (row) => row.pending_status,
    header: "Status pendientes",
    columnTitle: "Status pendientes por mandar",
    minSize: 30,
    enableSorting: true,
  },
  {
    accessorKey: "total",
    accessorFn: (row) => row.total,
    header: "Total",
    columnTitle: "Total",
    columnTitleCustom:
      "Cantidad total de logs recibidos en el intervalo de 10 minutos",
    size: 120,
    enableSorting: true,
  },
  {
    accessorKey: "restart",
    accessorFn: (row) => row.restart,
    header: "Restart",
    columnTitle: "Restart",
    columnTitleCustom: "Cantidad de logs recibidos de reinicios de pipeline",
    size: 120,
  },
  {
    accessorKey: "camera_missing",
    accessorFn: (row) => row.camera_connection,
    header: "Cámaras",
    columnTitle: "Cámaras",
    columnTitleCustom: "Cantidad de logs recibidos de desconexiones de cámaras",
    size: 120,
  },
  {
    accessorKey: "read_only_ssd",
    accessorFn: (row) => row.read_only_ssd,
    header: "Read only",
    columnTitle: "Read only SSD",
    columnTitleCustom: 'Cantidad de logs de "read only SSD" recibidos',
    size: 120,
  },
  {
    accessorKey: "forced_reboot",
    accessorFn: (row) => row.forced_reboot,
    header: "Forced reboot",
    columnTitle: "Forced reboot",
    columnTitleCustom: 'Cantidad de logs de "forced reboot" recibidos',
    size: 120,
  },
  {
    accessorKey: "start",
    accessorFn: (row) => row.start,
    header: "Start",
    columnTitle: "Start",
    columnTitleCustom: "Cantidad de logs recibidos de inicio de pipeline",
    size: 120,
  },
  {
    accessorKey: "reboot",
    accessorFn: (row) => row.reboot,
    header: "Reboot",
    columnTitle: "Reboot",
    columnTitleCustom: "Cantidad de logs recibidos de encendido de GX",
    size: 120,
  },
  {
    accessorKey: "data_validation",
    accessorFn: (row) => row.reboot,
    header: "Data Val",
    columnTitle: "Data Val",
    columnTitleCustom: 'Cantidad de logs de "data validation" recibidos',
    size: 120,
  },
  {
    accessorKey: "source_missing",
    accessorFn: (row) => row.source_missing,
    header: "SourceID",
    columnTitle: "SourceID",
    columnTitleCustom: 'Cantidad de logs de "source id missing" recibidos',
    size: 120,
  },
  {
    accessorKey: "storage_devices",
    accessorFn: (row) => row.storage_devices,
    header: "Memory",
    columnTitle: "Memory",
    columnTitleCustom: "Cantidad de logs de errores de memoria recibidos",
    size: 120,
  },
  {
    accessorKey: "others",
    accessorFn: (row) => row.others,
    header: "Others",
    columnTitle: "Others",
    columnTitleCustom: "Cantidad de logs recibidos de otros casos",
    size: 120,
  },
];

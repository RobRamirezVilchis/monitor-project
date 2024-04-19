"use client";

import {
  useUnitHistoryQuery,
  useUnitLastActiveStatus,
  useUnitLastStatusChange,
  useUnitSeverityHistory,
  useUnitStatusQuery,
} from "@/api/queries/monitor";
import { Unit, UnitHistory } from "@/api/services/monitor/types";

import { useDataGrid, useSsrDataGrid } from "@/hooks/data-grid";
import DataGrid from "@/ui/data-grid/DataGrid";
import { ColumnDef } from "@/ui/data-grid/types";

import { format, formatDistanceToNow, lightFormat, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
//import { BarChart } from "@mantine/charts";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ScatterChart,
  Scatter,
} from "recharts";

import Link from "next/link";
import { useState } from "react";
import { DatePickerInput } from "@mantine/dates";
import { Button } from "@mantine/core";

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
const barColors: { [key in StatusKey]: string } = {
  0: "#c9c9c9",
  1: "#70bafa",
  2: "#57d46c",
  3: "#ffd919",
  4: "#fca14c",
  5: "#f74a36",
};

const UnitPage = ({ params }: { params: { unit_id: string } }) => {
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
    unitStatus?.description == "Muchos logs pendientes" ||
    unitStatus?.description == "Demasiados logs pendientes" ||
    unitStatus?.description == "Sin comunicación reciente" ||
    unitStatus?.description == "Sin comunicación reciente (< 1 día)";

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

  const unitSeverityHistory = useUnitSeverityHistory({
    variables: {
      unit_id: params.unit_id,
      register_datetime_after: dateValue[0],
      register_datetime_before: dateValue[1],
    },
  });

  const plotData = unitSeverityHistory.data;

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
    <section className="relative mb-20">
      <Link
        href={"/monitor/safedriving/details"}
        className="absolute hidden lg:block right-full mr-5 mt-2 opacity-40"
      >
        <ArrowBackIcon />
      </Link>
      <div className="relative flex mb-4 justify-between items-center">
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
          <div className="absolute right-4 bottom-6 md:static flex items-center top-0">
            <span className="animate-ping inline-flex h-3 w-3 rounded-full bg-blue-400 opacity-100"></span>
            <div className="text-2xl font-semibold ml-6">En viaje</div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-end">
        <div>
          {inactive && unitLastActiveStatus.data && (
            <p className="text-xl text-gray-500">
              Último estátus activo:{" "}
              {statusNames[unitLastActiveStatus?.data.severity as StatusKey]} -{" "}
              {unitLastActiveStatus?.data.description}
            </p>
          )}
          {unitStatus && (
            <div className="text-xl text-gray-500">
              {unitStatus.last_connection && (
                <p>
                  Última conexión:{" "}
                  {format(parseISO(unitStatus.last_connection), "Pp")}
                </p>
              )}
              {unitStatus.last_connection &&
                (unitStatus.pending_events == 1 ? (
                  <p>{unitStatus.pending_events} evento pendiente</p>
                ) : (
                  <p>{unitStatus.pending_events} eventos pendientes</p>
                ))}
              {unitStatus.last_connection &&
                (unitStatus.pending_status == 1 ? (
                  <p>{unitStatus.pending_status} status pendiente</p>
                ) : (
                  <p>{unitStatus.pending_status} status pendientes</p>
                ))}
            </div>
          )}
        </div>
        <div>
          <Link href={`${params.unit_id}/logs`}>
            <Button size="md">Consultar logs</Button>
          </Link>
        </div>
      </div>

      <div className="h-[70vh] mb-10">
        <DataGrid instance={grid} />
      </div>

      <div className="md:flex items-center gap-8">
        <p className="text-2xl opacity-60">Gráfica de estátus: </p>
        <div className="w-80">
          <DatePickerInput
            type="range"
            placeholder="Pick date"
            value={dateValue}
            onChange={setDateValue}
          />
        </div>
      </div>
      {plotData && (
        <ResponsiveContainer width="100%" height={500}>
          <ScatterChart
            margin={{
              top: 20,
              right: 20,
              bottom: 120,
              left: 20,
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

            <Tooltip />
            <Scatter data={plotData} dataKey="severidad" fill="#8884d8">
              {plotData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={barColors[entry.severidad as StatusKey]}
                ></Cell>
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      )}
    </section>
  );
};

const RenderTooltip = ({ data: num }: { data: number }) => {
  return <div>{num}</div>;
};

//export default UnitPage;
export default UnitPage;

const ConvertBool = (row: UnitHistory) => {
  if (row.on_trip) {
    return "Sí";
  } else {
    return "No";
  }
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
    accessorFn: ConvertBool,
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

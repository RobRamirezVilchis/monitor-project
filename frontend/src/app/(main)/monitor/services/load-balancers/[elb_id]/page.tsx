"use client";

import {
  useLoadBalancerHistoryQuery,
  useLoadBalancerMetricsKeysQuery,
  useLoadBalancerPlotQuery,
  useLoadBalancerSeverityHistoryQuery,
  useLoadBalancerStatusQuery,
} from "@/api/queries/monitor";
import { ScatterplotPoint, ServerHistory } from "@/api/services/monitor/types";
import { useDataGrid, useSsrDataGrid } from "@/hooks/data-grid";
import DataGrid from "@/ui/data-grid/DataGrid";
import { ColumnDef } from "@/ui/data-grid/types";
import { ChartTooltipProps, LineChart } from "@mantine/charts";
import { SegmentedControl, Skeleton } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { format, parseISO } from "date-fns";
import { useState } from "react";
import Breadcrumbs from "../../../(components)/Breadcrumbs";
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
} from "recharts";
import { dotColors, StatusKey } from "../../../(components)/colors";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

const statusStyles: { [condition: string]: string } = {
  normal: "bg-blue-100 border-blue-400 text-blue-900",
  critical: "bg-red-100 border-red-400 text-red-900",
};

const capitalize = (text: string) => {
  return text
    .split(" ")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
};

const LoadBalancerPage = ({ params }: { params: { elb_id: string } }) => {
  const [plotMetric, setPlotMetric] = useState("Cantidad de peticiones");

  const currentDate = new Date();
  let yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const [dateValue, setDateValue] = useState<[Date | null, Date | null]>([
    yesterday,
    currentDate,
  ]);
  const [scatterplotDate, setScatterplotDate] = useState<
    [Date | null, Date | null]
  >([yesterday, currentDate]);

  const { dataGridState, queryVariables, dataGridConfig } = useSsrDataGrid<{
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

  const elbStatusQuery = useLoadBalancerStatusQuery({
    variables: {
      elb_id: params.elb_id,
    },
  });
  const elbStatus = elbStatusQuery.data;
  const activity_data = elbStatus?.activity_data;

  const metricsKeysQuery = useLoadBalancerMetricsKeysQuery({});
  const metricsKeys = metricsKeysQuery.data?.metrics;

  const elbHistoryQuery = useLoadBalancerHistoryQuery({
    variables: {
      elb_id: params.elb_id,
      ...queryVariables,
    },
  });

  const plotDataQuery = useLoadBalancerPlotQuery({
    variables: {
      elb_id: params.elb_id,
      metric_type: plotMetric,
      sort: "-register_datetime",
      register_datetime_after: dateValue[0],
      register_datetime_before: dateValue[1],
    },
  });
  let plotData = plotDataQuery.data;

  const scatterplotQuery = useLoadBalancerSeverityHistoryQuery({
    variables: {
      elb_id: params.elb_id,
      register_datetime_after: scatterplotDate[0],
      register_datetime_before: scatterplotDate[1],
    },
  });

  let scatterplotData: ScatterplotPoint[] = [];
  if (scatterplotQuery.data) {
    scatterplotData = scatterplotQuery.data.map((entry) => ({
      hour: entry.hour,
      severity: entry.critical ? 5 : 1,
    }));
  }

  if (
    (plotMetric == "Espacio disponible" || plotMetric == "RAM disponible") &&
    plotData
  ) {
    plotData = plotData.map((x) => ({
      ...x,
      metric_value: x.metric_value / 1e9,
    }));
  }

  const modifiedCols = cols.map((col) => {
    if (col.accessorKey === "metric_type" && metricsKeys) {
      return {
        ...col,
        accessorFn: (row: ServerHistory) => metricsKeys[row.metric_type],
      };
    }
    return col;
  });

  const grid = useDataGrid<ServerHistory>({
    data: elbHistoryQuery.data?.data || [],
    columns: modifiedCols,
    rowNumberingMode: "static",
    enableRowNumbering: true,
    disableCellSelectionOnClick: true,
    initialState: {
      density: "compact",
    },
    state: {
      loading: elbHistoryQuery.isLoading || elbHistoryQuery.isFetching,
      ...dataGridState,
    },
    enableColumnResizing: true,
    hideColumnFooters: true,
    enableColumnActions: true,
    enableMultiSort: true,

    ...(dataGridConfig as any),
    pageCount: elbHistoryQuery.data?.pagination?.pages ?? 0,
    rowCount: elbHistoryQuery.data?.pagination?.count ?? 0,
  });

  let progressValue;
  if (activity_data && activity_data["Uso de CPU"]) {
    progressValue = activity_data["Uso de CPU"];
  } else {
    progressValue = 0;
  }

  let metrics: string[] = [];
  if (metricsKeys) {
    metrics = Object.values(metricsKeys);
  }

  let color;
  if (elbStatus && elbStatus.critical) {
    color = statusStyles.critical;
  } else {
    color = statusStyles.normal;
  }

  let statusColor;
  if (elbStatus && elbStatus.state_code == "active") {
    statusColor = "green";
  } else {
    statusColor = "orange";
  }

  let splitter = new RegExp("_|-", "g");

  return (
    <section className="relative mb-20">
      {/* <BackArrow /> */}
      <div className="sm:flex mb-6 items-center justify-between">
        <div className="sm:flex space-y-2 sm:space-y-0 justify-start items-start sm:items-center">
          <h1 className="text-5xl font-bold mr-6">
            {/* <span className="hidden md:inline text-gray-400 dark:text-gray-600">
              Distribuidores de carga /{" "}
            </span>
            {elbStatus && (
              <span>
                {capitalize(elbStatus.name.split(splitter).join(" "))}
              </span>
            )} */}
            {elbStatus && (
              <Breadcrumbs
                links={[
                  {
                    href: "/monitor/services/load-balancers/details/",
                    name: "Distribuidores de carga",
                  },
                ]}
                pageName={capitalize(elbStatus.name.split(splitter).join(" "))}
              />
            )}
          </h1>
          {elbStatus && (
            <div
              className={`px-3 py-1.5 w-fit  text-2xl align-middle font-semibold 
          border-2 ${color} rounded-full`}
            >
              {elbStatus.critical ? "Crítico" : "Normal"}
            </div>
          )}
        </div>
        {elbStatus && (
          <div className="flex mt-3 sm:mt-0 ml-0 sm:ml-4 items-center">
            <span
              className={`inline-flex h-4 w-4 rounded-full  bg-${statusColor}-500 opacity-100`}
            ></span>
            <div className="text-2xl font-semibold opacity-80 ml-3">
              {capitalize(elbStatus.state_code)}
            </div>
          </div>
        )}
      </div>
      {elbStatus ? (
        <div className="text-xl text-neutral-500 dark:text-dark-200">
          <p>
            Última actividad:{" "}
            {format(parseISO(String(elbStatus.last_activity)), "Pp")}
          </p>
          {activity_data && (
            <div>
              <div>
                <span>Cantidad de peticiones: </span>
                <span>{activity_data["Cantidad de peticiones"]}</span>
              </div>
              <div className="sm:flex gap-4 items-center">
                <p>
                  <span>Tiempo de respuesta: </span>
                  {activity_data["Tiempo de respuesta"] ? (
                    <span>
                      {activity_data["Tiempo de respuesta"].toFixed(2) +
                        " segundos"}
                    </span>
                  ) : (
                    <span>{"0%"}</span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Skeleton h={20} w={300} />
          <Skeleton h={20} w={300} />
          <Skeleton h={20} w={300} />
        </div>
      )}

      <h2 className="text-3xl text-neutral-500 dark:text-dark-200 mb-2 mt-8">
        Gráfica de métricas
      </h2>
      <div className="md:flex items-center gap-8 mb-4 justify-between">
        <div className="mt-1 sm:mt-0">
          {metrics.length == 0 && (
            <Skeleton visible={metrics.length == 0} h={30} w={300} />
          )}
          <div className="hidden sm:block">
            <SegmentedControl
              value={plotMetric}
              onChange={setPlotMetric}
              data={metrics}
              classNames={{
                root: "bg-neutral-200 dark:bg-dark-700 rounded-xl",
                indicator: "rounded-lg",
              }}
            ></SegmentedControl>
          </div>
          <div className="block sm:hidden">
            <SegmentedControl
              value={plotMetric}
              onChange={setPlotMetric}
              orientation="vertical"
              data={metrics}
              classNames={{
                root: "bg-neutral-200 dark:bg-dark-700 rounded-xl",
                indicator: "rounded-lg",
              }}
            ></SegmentedControl>
          </div>
        </div>
        <div className="flex w-96 gap-2 items-center mt-3 sm:mt-0">
          <p>Rango de tiempo:</p>
          <DatePickerInput
            type="range"
            placeholder="Pick date"
            value={dateValue}
            onChange={setDateValue}
          />
        </div>
      </div>
      <Skeleton visible={plotData == undefined}>
        <LineChart
          tooltipProps={{
            content: ({ label, payload }) => (
              <LineTooltip label={label} payload={payload} />
            ),
          }}
          h={450}
          data={plotData as Record<string, any>[]}
          dataKey="register_datetime"
          series={[{ name: "metric_value", color: "green.6" }]}
          curveType="linear"
          withDots={false}
        ></LineChart>
      </Skeleton>

      <div className=" items-center gap-8 mt-32">
        <p className="text-3xl text-neutral-500 dark:text-dark-200 mb-2">
          Gráfica de estatus{" "}
        </p>
        <div className="flex items-center">
          <p className="hidden sm:block mr-2">Rango de fechas:</p>
          <div className="w-80 mt-1 sm:mt-0">
            <DatePickerInput
              type="range"
              placeholder="Pick date"
              value={scatterplotDate}
              onChange={setScatterplotDate}
            />
          </div>
        </div>
      </div>
      {scatterplotData && scatterplotData.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart
            width={730}
            height={250}
            margin={{
              top: 20,
              right: 20,
            }}
          >
            <CartesianGrid strokeDasharray={"3 3"} />
            <XAxis dataKey="hour" />
            <YAxis
              type="number"
              dataKey="severity"
              domain={[0, "dataMax"]}
              interval={0}
              ticks={[0, 1, 2, 3, 4, 5]}
            />

            <Tooltip content={<PointTooltip />} />
            <Scatter data={scatterplotData} dataKey="severity" fill="#8884d8">
              {scatterplotData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={dotColors[entry.severity as StatusKey]}
                ></Cell>
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      )}

      <h2 className="text-3xl text-neutral-500 dark:text-dark-200 mb-2 mt-32">
        Listado de métricas
      </h2>
      <div className="h-[70vh] mt-5">
        <DataGrid instance={grid} />
      </div>
    </section>
  );
};

export default LoadBalancerPage;

const PointTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) => {
  let metric_date, metric_value, metric_name;

  if (active && payload && payload.length) {
    metric_date = format(parseISO(payload[0].payload.hour), "Pp");
    console.log(metric_date);
    return (
      <div className="custom-tooltip bg-white dark:bg-dark-500 p-4 rounded-md shadow-md">
        <p className="label font-bold">{metric_date}</p>
        <p className="label">{`Estatus: ${
          Number(payload[1].value) == 5 ? "Crítico" : "Normal"
        }`}</p>
      </div>
    );
  }

  return null;
};

function LineTooltip({ label, payload }: ChartTooltipProps) {
  if (!payload) return null;
  let metric_date, metric_value, metric_name;
  if (payload.length) {
    metric_date = format(parseISO(payload[0].payload.register_datetime), "Pp");
    metric_name = payload[0].payload.metric_type;
    switch (metric_name) {
      case "RequestCount":
        metric_value = payload[0].payload.metric_value;
        break;
      case "HTTPCode_Target_5XX_Count":
        metric_value = payload[0].payload.metric_value;
        break;
      case "TargetResponseTime":
        metric_value = payload[0].payload.metric_value.toFixed(2) + " s";
        break;
    }
  }
  return (
    <div>
      {payload.length && (
        <div className="bg-white dark:bg-dark-500 p-4 rounded-md shadow-md">
          <p className="font-bold">{metric_date}</p>
          <span>{metric_name}: </span>
          <span>{metric_value}</span>
        </div>
      )}
    </div>
  );
}

const cols: ColumnDef<ServerHistory>[] = [
  {
    accessorKey: "register_datetime",
    accessorFn: (row) => format(parseISO(String(row.register_datetime)), "Pp"),
    header: "Fecha",
    columnTitle: "Fecha",
    columnTitleCustom:
      "Fecha y hora de registro, cada uno considera logs en un intervalo de 10 minutos hacia atrás",
    minSize: 250,
    enableSorting: true,
    filterVariant: "datetime-range",
  },
  {
    accessorKey: "metric_type",
    accessorFn: (row) => row.metric_type,
    header: "Métrica",
    columnTitle: "Métrica",
    minSize: 300,
    enableSorting: true,
    //filterVariant: "datetime-range",
  },
  {
    accessorKey: "metric_value",
    accessorFn: (row) => parseMetric(row.metric_type, row.metric_value),
    header: "Valor",
    columnTitle: "Valor",
    minSize: 200,
    enableSorting: true,
    //filterVariant: "datetime-range",
  },
  {
    accessorKey: "critical",
    accessorFn: (row) => row.critical,
    header: "Crítico",
    columnTitle: "Crítico",
    minSize: 200,
    enableSorting: true,
  },
];

const parseMetric = (metricType: string, metricValue: number) => {
  switch (metricType) {
    case "CPUUtilization":
      return metricValue.toFixed(2) + " %";
    case "FreeableMemory":
      return (metricValue / 1e9).toFixed(2) + " GB";
    case "FreeStorageSpace":
      return (metricValue / 1e9).toFixed(2) + " GB";
    default:
      return metricValue;
  }
};

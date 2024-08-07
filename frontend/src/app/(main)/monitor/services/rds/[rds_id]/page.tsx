"use client";

import {
  useRDSHistoryQuery,
  useRDSMetricsKeysQuery,
  useRDSPlotQuery,
  useRDSSeverityHistoryQuery,
  useRDSStatusQuery,
  useRDSThresholdsQuery,
} from "@/api/queries/monitor";
import {
  ScatterplotPoint,
  ServerHistory,
  ServiceMetricThreshold,
} from "@/api/services/monitor/types";
import { useDataGrid, useSsrDataGrid } from "@/hooks/data-grid";
import DataGrid from "@/ui/data-grid/DataGrid";
import { ColumnDef } from "@/ui/data-grid/types";
import { ChartTooltipProps, LineChart } from "@mantine/charts";
import {
  Button,
  Modal,
  Progress,
  SegmentedControl,
  Skeleton,
} from "@mantine/core";
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
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { dotColors, StatusKey } from "../../../(components)/colors";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "react-hook-form";
import { showSuccessNotification } from "@/ui/notifications";
import { useModifyRDSThresholdsMutation } from "@/api/mutations/monitor";
import { Checkbox, NumberInput } from "@/ui/core";

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

const RDSPage = ({ params }: { params: { rds_id: string } }) => {
  const [plotMetric, setPlotMetric] = useState("Uso de CPU");
  const [
    thresholdsModalOpened,
    { open: thresholdsModalOpen, close: thresholdsModalClose },
  ] = useDisclosure(false);

  const {
    handleSubmit: handleSubmitThresholds,
    watch: watchThresholds,
    control: controlThresholds,
    reset: resetThresholds,
  } = useForm<{ [key: string]: any }>();

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

  const rdsStatusQuery = useRDSStatusQuery({
    variables: {
      rds_id: params.rds_id,
    },
  });
  const rdsStatus = rdsStatusQuery.data;
  const activity_data = rdsStatus?.activity_data;

  const metricsKeysQuery = useRDSMetricsKeysQuery({});
  const metricsKeys = metricsKeysQuery.data?.metrics;

  const rdsHistoryQuery = useRDSHistoryQuery({
    variables: {
      rds_id: params.rds_id,
      ...queryVariables,
    },
  });

  const plotDataQuery = useRDSPlotQuery({
    variables: {
      rds_id: params.rds_id,
      metric_type: plotMetric,
      sort: "-register_datetime",
      register_datetime_after: dateValue[0],
      register_datetime_before: dateValue[1],
    },
  });
  let plotData = plotDataQuery.data;

  const scatterplotQuery = useRDSSeverityHistoryQuery({
    variables: {
      rds_id: params.rds_id,
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
    data: rdsHistoryQuery.data?.data || [],
    columns: modifiedCols,
    rowNumberingMode: "static",
    enableRowNumbering: true,
    disableCellSelectionOnClick: true,
    initialState: {
      density: "compact",
    },
    state: {
      loading: rdsHistoryQuery.isLoading || rdsHistoryQuery.isFetching,
      ...dataGridState,
    },
    enableColumnResizing: true,
    hideColumnFooters: true,
    enableColumnActions: true,
    enableMultiSort: true,

    ...(dataGridConfig as any),
    pageCount: rdsHistoryQuery.data?.pagination?.pages ?? 0,
    rowCount: rdsHistoryQuery.data?.pagination?.count ?? 0,
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
  if (rdsStatus && rdsStatus.critical) {
    color = statusStyles.critical;
  } else {
    color = statusStyles.normal;
  }

  let statusColor;
  if (rdsStatus && rdsStatus.status == "available") {
    statusColor = "green";
  } else {
    statusColor = "orange";
  }

  let splitter = new RegExp("_|-", "g");

  const thresholdsQuery = useRDSThresholdsQuery({});

  const thresholdsMutation = useModifyRDSThresholdsMutation({
    onSuccess: () => {
      showSuccessNotification({
        message: "Se guardaron los nuevos valores con éxito",
      });
    },
    onError: () => {},
  });

  const submitNewThresholds = async (values: { [key: string]: any }) => {
    let data: ServiceMetricThreshold[] = [];

    thresholdsQuery.data?.forEach((th) => {
      data.push({
        name: th.name,
        to_exceed: values[`${th.name}_toExceed`],
        ...(values[`${th.name}_enabled`]
          ? {
              value: values[`${th.name}_value`],
            }
          : {
              value: null,
            }),
      });
    });
    thresholdsMutation.mutate(data);
  };

  return (
    <section className="relative mb-20">
      <Modal
        centered
        opened={thresholdsModalOpened}
        onClose={thresholdsModalClose}
        title="Modificar criterios"
        classNames={{ title: "text-xl font-semibold" }}
        size={"lg"}
      >
        <form onSubmit={handleSubmitThresholds(submitNewThresholds)}>
          <p className="opacity-80 mb-3">
            Aquí puedes modificar los valores a partir de los cuales se
            considera una métrica como crítica.
          </p>

          <div className="flex justify-center">
            <div className="flex flex-col gap-3 items-center  mb-3">
              <div className="ml-3 grid grid-cols-5 place-items-center gap-y-2 gap-x-2 items-end">
                <div></div>
                <div></div>
                <div></div>
                <div className="flex items-center">
                  <p className="">Sobrepasar</p>
                </div>
                <div className="flex items-center">
                  <p className="">Habilitado</p>
                </div>
                {thresholdsQuery.data?.map((th) => (
                  <>
                    <div className="flex col-span-2 items-center">
                      <p>{th.name}</p>
                    </div>
                    <NumberInput
                      name={`${th.name}_value`}
                      control={controlThresholds}
                      classNames={{ root: "w-20" }}
                      placeholder=""
                      value={th.value}
                      disabled={!watchThresholds(`${th.name}_enabled`)}
                    ></NumberInput>
                    <Checkbox
                      name={`${th.name}_toExceed`}
                      control={controlThresholds}
                      disabled={!watchThresholds(`${th.name}_enabled`)}
                      classNames={{ root: "" }}
                    ></Checkbox>
                    <Checkbox
                      name={`${th.name}_enabled`}
                      control={controlThresholds}
                      color="green.6"
                    ></Checkbox>
                  </>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit">Aceptar</Button>
          </div>
        </form>
      </Modal>
      {/* <BackArrow /> */}
      <div className="sm:flex mb-6 items-center justify-between">
        <div className="sm:flex space-y-2 sm:space-y-0 justify-start items-start sm:items-center">
          <h1 className="text-5xl font-bold mr-6">
            {/*  <span className="hidden md:inline text-gray-400 dark:text-gray-600">
              Bases de datos /{" "}
            </span>
            {rdsStatus && (
              <span>
                {capitalize(rdsStatus.name.split(splitter).join(" "))}
              </span>
            )} */}
            {rdsStatus && (
              <Breadcrumbs
                links={[
                  {
                    href: "/monitor/services/rds/details/",
                    name: "Bases de datos",
                  },
                ]}
                pageName={capitalize(rdsStatus.name.split(splitter).join(" "))}
              />
            )}
          </h1>
          {rdsStatus && (
            <div
              className={`px-3 py-1.5 w-fit text-2xl align-middle font-semibold 
          border-2 ${color} rounded-full`}
            >
              {rdsStatus.critical ? "Crítico" : "Normal"}
            </div>
          )}
        </div>

        {rdsStatus && (
          <div className="flex mt-3 sm:mt-0 ml-0  sm:ml-4 items-center">
            <span
              className={`inline-flex h-4 w-4 rounded-full  bg-${statusColor}-500 opacity-100`}
            ></span>
            <div className="text-2xl font-semibold opacity-80 ml-3">
              {capitalize(rdsStatus.status)}
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-between items-end">
        {rdsStatus ? (
          <div className="text-xl text-neutral-500 dark:text-dark-200">
            <p>
              Última actividad:{" "}
              {format(parseISO(String(rdsStatus.last_activity)), "Pp")}
            </p>
            {activity_data && (
              <div>
                <div>
                  <span>Espacio disponible: </span>
                  <span>
                    {(activity_data["Espacio disponible"] / 1e9).toFixed(2)} GB
                    de {rdsStatus.total_storage} GB
                  </span>
                </div>
                <div>
                  <span>Memoria RAM disponible: </span>
                  <span>
                    {(activity_data["RAM disponible"] / 1e9).toFixed(2)} GB de{" "}
                    {rdsStatus.total_ram} GB
                  </span>
                </div>
                <div className="sm:flex gap-4 items-center">
                  <p>
                    <span>Uso de CPU: </span>
                    {activity_data["Uso de CPU"] ? (
                      <span>
                        {activity_data["Uso de CPU"].toFixed(2) + "%"}
                      </span>
                    ) : (
                      <span>{"0%"}</span>
                    )}
                  </p>

                  <Progress
                    size={"xl"}
                    classNames={{
                      root: "w-48 bg-gray-300 dark:bg-gray-700 mb-2 sm:mb-0",
                    }}
                    value={progressValue}
                    color="green"
                  ></Progress>
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
        {thresholdsQuery.data && (
          <Button
            variant="outline"
            color="green.6"
            onClick={() => {
              const currentValues: { [key: string]: any } = {};

              thresholdsQuery.data.map((th) => {
                currentValues[`${th.name}_value`] = th.value;
                currentValues[`${th.name}_toExceed`] = th.to_exceed;
                currentValues[`${th.name}_enabled`] = th.value !== null;
              });
              resetThresholds(currentValues);
              thresholdsModalOpen();
            }}
          >
            Modificar criterios
          </Button>
        )}
      </div>

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
        <div className="sm:flex max-w-24 gap-2 items-center mt-2 md:mt-0">
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
        <p className="text-2xl text-neutral-500 dark:text-dark-200 mb-2">
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

export default RDSPage;

const ConvertBool = (condition: boolean) => (condition ? "Sí" : "No");

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
      case "FreeStorageSpace":
        metric_value = payload[0].payload.metric_value.toFixed(2) + " GB";
        break;
      case "FreeableMemory":
        metric_value = payload[0].payload.metric_value.toFixed(2) + " GB";
        break;
      case "CPUUtilization":
        metric_value = payload[0].payload.metric_value.toFixed(2) + "%";
        break;
      case "DatabaseConnections":
        metric_value = payload[0].payload.metric_value.toFixed(2);
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

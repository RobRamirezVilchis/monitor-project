"use client";

import {
  useMetricsKeysQuery,
  useProjectsQuery,
  useServerHistoryQuery,
  useServerPlotQuery,
  useServerProjectsQuery,
  useServerStatusQuery,
} from "@/api/queries/monitor";
import BackArrow from "../../../(components)/BackArrow";
import { format, parseISO } from "date-fns";
import { PaymentOutlined, Spa } from "@mui/icons-material";
import {
  Button,
  Modal,
  Progress,
  SegmentedControl,
  Select,
  Skeleton,
  TextInput,
} from "@mantine/core";
import { useDataGrid, useSsrDataGrid } from "@/hooks/data-grid";
import {
  ModifyProjectsData,
  ServerHistory,
  ServerHistoryFilters,
  StatusHistory,
} from "@/api/services/monitor/types";
import { ColumnDef } from "@/ui/data-grid/types";
import DataGrid from "@/ui/data-grid/DataGrid";
import { ChartTooltipProps, LineChart } from "@mantine/charts";
import { useDisclosure, useMergedRef } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "react-hook-form";
import { MultiSelect } from "@/ui/core";
import { useModifyServerProjectsMutation } from "@/api/mutations/monitor";
import { setRequestMeta } from "next/dist/server/request-meta";
import Breadcrumbs from "../../../(components)/Breadcrumbs";

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

const ServerPage = ({ params }: { params: { server_id: string } }) => {
  const [plotMetric, setPlotMetric] = useState("Uso de CPU");
  const [opened, { open, close }] = useDisclosure(false);
  const [assignedProjects, setProjects] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const currentDate = new Date();
  let yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm<ModifyProjectsData>({
    defaultValues: {
      server_id: params.server_id,
      projects: [],
    },
  });

  const [dateValue, setDateValue] = useState<[Date | null, Date | null]>([
    yesterday,
    currentDate,
  ]);

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

  const serverStatusQuery = useServerStatusQuery({
    variables: {
      server_id: params.server_id,
    },
  });
  const serverStatus = serverStatusQuery.data;
  const activity_data = serverStatus?.activity_data;

  const metricsKeysQuery = useMetricsKeysQuery({});
  const metricsKeys = metricsKeysQuery.data?.metrics;

  const serverHistoryQuery = useServerHistoryQuery({
    variables: {
      server_id: params.server_id,
      ...queryVariables,
    },
  });

  const plotDataQuery = useServerPlotQuery({
    variables: {
      server_id: params.server_id,
      metric_type: plotMetric,
      sort: "-register_datetime",
      register_datetime_after: dateValue[0],
      register_datetime_before: dateValue[1],
    },
  });
  let plotData = plotDataQuery.data;

  const serverProjectsData = useServerProjectsQuery({
    variables: {
      server_id: params.server_id,
    },
  }).data;
  const serverProjects = serverProjectsData?.map((obj) => obj.name);

  const allProjectsData = useProjectsQuery({}).data;
  const allProjects = allProjectsData?.map((obj) => obj.name);

  useEffect(() => {
    if (serverProjectsData) {
      reset({ projects: serverProjects });
    }
  }, [serverProjectsData, reset]);

  const modifyProjectsMutation = useModifyServerProjectsMutation({
    onSuccess: () => {
      setSuccess(true);
    },
    onError: (error: any, variables, context) => {
      setError("Ocurrió un error");
    },
  });

  const onSubmit = async (values: ModifyProjectsData) => {
    values.server_id = params.server_id;
    modifyProjectsMutation.mutate(values);
  };

  if (plotMetric == "Datos de salida" && plotData) {
    plotData = plotData.map((x) => ({
      ...x,
      metric_value: x.metric_value / 300 / 1e6,
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
    data: serverHistoryQuery.data?.data || [],
    columns: modifiedCols,
    rowNumberingMode: "static",
    enableRowNumbering: true,
    disableCellSelectionOnClick: true,
    initialState: {
      density: "compact",
    },
    state: {
      loading: serverHistoryQuery.isLoading || serverHistoryQuery.isFetching,
      ...dataGridState,
    },
    enableColumnResizing: true,
    hideColumnFooters: true,
    enableColumnActions: true,
    enableMultiSort: true,

    ...(dataGridConfig as any),
    pageCount: serverHistoryQuery.data?.pagination?.pages ?? 0,
    rowCount: serverHistoryQuery.data?.pagination?.count ?? 0,
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
  if (serverStatus && serverStatus.critical) {
    color = statusStyles.critical;
  } else {
    color = statusStyles.normal;
  }

  let statusColor;
  if (serverStatus && serverStatus.state == "running") {
    statusColor = "green";
  } else {
    statusColor = "orange";
  }

  let splitter = new RegExp("_|-", "g");

  return (
    <section className="relative mb-20">
      <Modal
        centered
        opened={opened}
        onClose={close}
        title="Modificar proyectos asignados"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            {serverProjects && (
              <MultiSelect
                name="projects"
                control={control}
                value={assignedProjects}
                onChange={setProjects}
                data={allProjects}
                placeholder="Proyectos"
                searchable
              />
            )}
          </div>

          <Button type="submit" color="green.6">
            Aceptar
          </Button>
        </form>
      </Modal>
      {/* <BackArrow /> */}
      <div className="sm:flex mb-6 items-center justify-between">
        <div className="flex justify-start items-start sm:items-center">
          <h1 className="text-5xl font-bold mr-6">
            {/* <span className="hidden md:inline text-gray-400 dark:text-gray-600">
              Servidores /{" "}
            </span>
            {serverStatus && (
              <span>
                {capitalize(serverStatus.server_name.split(splitter).join(" "))}
              </span>
            )} */}
            {serverStatus && (
              <Breadcrumbs
                links={[
                  {
                    href: "/monitor/services/servers/details/",
                    name: "Servidores",
                  },
                ]}
                pageName={capitalize(
                  serverStatus.server_name.split(splitter).join(" ")
                )}
              />
            )}
          </h1>
          {serverStatus && (
            <div
              className={`px-3 py-1.5  text-2xl align-middle font-semibold 
          border-2 ${color} rounded-full`}
            >
              {serverStatus.critical ? "Crítico" : "Normal"}
            </div>
          )}
        </div>
        {serverStatus && (
          <div className="flex mt-3 sm:mt-0 ml-0 sm:ml-4 items-center">
            <span
              className={`inline-flex h-4 w-4 rounded-full  bg-${statusColor}-500 opacity-100`}
            ></span>
            <div className="text-2xl font-semibold opacity-80 ml-3">
              {capitalize(serverStatus.state)}
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-between items-end">
        {serverStatus ? (
          <div className="text-xl text-gray-500">
            <p>
              Última actividad:{" "}
              {format(parseISO(String(serverStatus.last_activity)), "Pp")}
            </p>
            {activity_data && (
              <div>
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
                <p>
                  Datos de salida:{" "}
                  {(activity_data["Datos de salida"] / 300 / 1e6).toFixed(2)}{" "}
                  MB/s
                </p>
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
        <Button
          color="gray.5"
          classNames={{ root: "dark:bg-gray-800 dark:hover:bg-gray-700" }}
          onClick={open}
        >
          Modificar proyectos
        </Button>
      </div>

      <h2 className="text-3xl opacity-60 mb-2 mt-8">Gráfica de métricas</h2>
      <div className="md:flex items-center gap-8 mb-4 justify-between">
        <div className="mt-1 sm:mt-0">
          <SegmentedControl
            value={plotMetric}
            onChange={setPlotMetric}
            data={metrics}
            classNames={{
              root: "bg-gray-200 rounded-xl",
              indicator: "rounded-lg",
            }}
          ></SegmentedControl>
        </div>
        <div className="sm:flex w-96 gap-2 items-center mt-1 sm:mt-0">
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
              <ChartTooltip label={label} payload={payload} />
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

      <h2 className="text-3xl opacity-60 mb-2 mt-28">Listado de métricas</h2>
      <div className="h-[70vh] mt-5">
        <DataGrid instance={grid} />
      </div>
    </section>
  );
};

export default ServerPage;

function ChartTooltip({ label, payload }: ChartTooltipProps) {
  if (!payload) return null;
  let metric_date, metric_value, metric_name;
  if (payload.length) {
    metric_date = format(parseISO(payload[0].payload.register_datetime), "Pp");
    metric_name = payload[0].payload.metric_type;
    if (metric_name == "CPUUtilization") {
      metric_value = payload[0].payload.metric_value.toFixed(2) + "%";
    } else if (metric_name == "NetworkOut") {
      metric_value = payload[0].payload.metric_value.toFixed(2) + " MB/s";
    }
  }

  return (
    <div>
      {payload.length && (
        <div className="bg-white p-4 rounded-md shadow-md">
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
    accessorKey: "last_launch",
    accessorFn: (row) =>
      row.last_launch
        ? format(parseISO(String(row.last_launch)), "Pp")
        : "Desconocida",
    header: "Último encendido",
    columnTitle: "Último encendido",
    minSize: 200,
  },
  {
    accessorKey: "metric_type",
    accessorFn: (row) => row.metric_type,
    header: "Métrica",
    columnTitle: "Métrica",
    minSize: 200,
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
    case "NetworkOut":
      return (metricValue / 300 / 1e6).toFixed(2) + " MB/s";
    default:
      return metricValue;
  }
};

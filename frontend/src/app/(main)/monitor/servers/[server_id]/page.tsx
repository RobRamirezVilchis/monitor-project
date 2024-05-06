"use client";

import {
  useMetricsKeysQuery,
  useServerHistoryQuery,
  useServerStatusQuery,
} from "@/api/queries/monitor";
import BackArrow from "../../(components)/BackArrow";
import { format, parseISO } from "date-fns";
import { Spa } from "@mui/icons-material";
import { Progress } from "@mantine/core";
import { useDataGrid, useSsrDataGrid } from "@/hooks/data-grid";
import { ServerHistory } from "@/api/services/monitor/types";
import { ColumnDef } from "@/ui/data-grid/types";
import DataGrid from "@/ui/data-grid/DataGrid";

const ServerPage = ({ params }: { params: { server_id: string } }) => {
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

  return (
    <section className="relative">
      <BackArrow />
      <h1 className="mb-6 text-5xl font-bold pr-10">
        <span className="hidden md:inline text-gray-400 dark:text-gray-600">
          Servidores /{" "}
        </span>
        {serverStatus && (
          <span>{serverStatus.server_name.split("_").join(" ")}</span>
        )}
      </h1>
      {serverStatus && (
        <div className="text-2xl text-gray-500">
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
                    <span>{activity_data["Uso de CPU"].toFixed(2) + "%"}</span>
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
                {(activity_data["Datos de salida"] / 300 / 1024).toFixed(2)}{" "}
                MB/s
              </p>
            </div>
          )}
        </div>
      )}
      <div className="h-[62vh] mb-10">
        <DataGrid instance={grid} />
      </div>
    </section>
  );
};

export default ServerPage;

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
    accessorFn: (row) =>
      row.metric_type == "CPUUtilization"
        ? row.metric_value.toFixed(2) + " %"
        : (row.metric_value / 300 / 1024).toFixed(2) + " MB/s",
    header: "Valor",
    columnTitle: "Valor",
    minSize: 200,
    enableSorting: true,
    //filterVariant: "datetime-range",
  },
];

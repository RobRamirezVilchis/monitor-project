"use client";

import {
  useDeviceLogsQuery,
  useDeviceStatusQuery,
} from "@/api/queries/monitor";
import { login } from "@/api/services/auth";
import { DeviceLogs, UnitHistory } from "@/api/services/monitor/types";
import { useDataGrid, useSsrDataGrid } from "@/hooks/data-grid";
import DataGrid from "@/ui/data-grid/DataGrid";
import { ColumnDef } from "@/ui/data-grid/types";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Checkbox } from "@mantine/core";
import { useState } from "react";

const DeviceLogsPage = ({ params }: { params: { device_id: string } }) => {
  const [showEmpty, setShowEmpty] = useState(true);

  const { dataGridState, queryVariables, dataGridConfig } = useSsrDataGrid<{
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

  const deviceStatusQuery = useDeviceStatusQuery({
    variables: {
      device_id: params.device_id,
    },
  });

  const deviceStatus = deviceStatusQuery.data;

  const deviceLogsQuery = useDeviceLogsQuery({
    variables: {
      device_id: params.device_id,
      show_empty: showEmpty,
      ...queryVariables,
    },
  });

  const grid = useDataGrid<DeviceLogs>({
    data: deviceLogsQuery.data?.data || [],
    columns: cols,
    rowNumberingMode: "static",
    enableRowNumbering: true,
    disableCellSelectionOnClick: true,

    initialState: {
      density: "compact",
    },
    state: {
      loading: deviceLogsQuery.isLoading || deviceLogsQuery.isFetching,
      ...dataGridState,
    },
    enableColumnResizing: true,
    hideColumnFooters: true,
    enableColumnActions: true,

    ...(dataGridConfig as any),
    enableMultiSort: true,
    pageCount: deviceLogsQuery.data?.pagination?.pages ?? 0,
    rowCount: deviceLogsQuery.data?.pagination?.count ?? 0,
  });

  return (
    <section className="relative">
      <Link
        href={`/monitor/industry/device/${params.device_id}`}
        className="absolute right-full mr-5 mt-2 opacity-40"
      >
        <ArrowBackIcon />
      </Link>

      <div className="flex text-5xl gap-4 mb-6">
        <h1 className="font-bold">{deviceStatus?.device}</h1>
        <h1 className="opacity-40">-</h1>
        <h1 className="opacity-40">Logs</h1>
      </div>
      <div className="flex justify-end">
        <Checkbox
          size="md"
          label={"Mostrar logs vacíos"}
          checked={showEmpty}
          onChange={(event) => setShowEmpty(event.currentTarget.checked)}
        />
      </div>

      <div className="h-[42rem]">
        <DataGrid instance={grid} />
      </div>
    </section>
  );
};

export default DeviceLogsPage;

const cols: ColumnDef<DeviceLogs>[] = [
  {
    accessorKey: "device",
    accessorFn: (row) => row.device,
    header: "Dispositivo",
    columnTitle: "Dispositivo",
    columnTitleCustom: "",
    minSize: 250,
    enableSorting: true,
    //filterVariant: "datetime-range",
    enableMultiSort: true,
  },
  {
    accessorKey: "register_time",
    accessorFn: (row) => format(parseISO(row.register_time), "Pp"),
    header: "Fecha",
    columnTitle: "Fecha",
    columnTitleCustom:
      "Fecha y hora de registro, cada uno considera logs en un intervalo de 10 minutos hacia atrás",
    minSize: 250,
    enableSorting: true,
    filterVariant: "datetime-range",
    enableMultiSort: true,
  },
  {
    accessorKey: "log",
    accessorFn: (row) => (row.log == "" ? "Vacío" : row.log),
    header: "Log",
    columnTitle: "Log",
    columnTitleCustom: "Log",
    minSize: 500,
    enableSorting: false,
  },
];
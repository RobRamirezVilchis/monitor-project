"use client";

import {
  useRetailDeviceLogsQuery,
  useRetailDeviceStatusQuery,
  useRombergDeviceLogsQuery,
  useRombergDeviceStatusQuery,
} from "@/api/queries/monitor";
import { DeviceLog, UnitLog } from "@/api/services/monitor/types";
import Breadcrumbs from "@/app/(main)/monitor/(components)/Breadcrumbs";
import { useDataGrid, useSsrDataGrid } from "@/hooks/data-grid";
import DataGrid from "@/ui/data-grid/DataGrid";
import { ColumnDef } from "@/ui/data-grid/types";
import { Checkbox } from "@mantine/core";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const RombergDeviceLogsPage = ({
  params,
}: {
  params: { device_id: string };
}) => {
  const router = useRouter();
  const [showEmpty, setShowEmpty] = useState(true);

  const { dataGridState, queryVariables, dataGridConfig } = useSsrDataGrid<{
    name: string;
    timestamp: [Date | null, Date | null];
  }>({
    defaultSorting: ["register_datetime"],
    queryStateOptions: {
      navigateOptions: {
        scroll: false,
      },
      history: "replace",
    },
    transform: {
      timestamp: (key, value) => {
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

  const deviceStatusQuery = useRombergDeviceStatusQuery({
    variables: {
      device_id: params.device_id,
    },
  });

  const deviceStatus = deviceStatusQuery.data;

  const deviceLogsQuery = useRombergDeviceLogsQuery({
    variables: {
      device_id: params.device_id,
      ...queryVariables,
    },
  });

  const grid = useDataGrid<UnitLog>({
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
      <div className="text-5xl mb-6">
        {deviceStatus && (
          <Breadcrumbs
            links={[
              { href: "/monitor/safe-driving/romberg", name: "Romberg" },
              {
                href: `/monitor/safe-driving/romberg/device/${params.device_id}/`,
                name: deviceStatus?.device_description,
              },
            ]}
            pageName="Logs"
          ></Breadcrumbs>
        )}
      </div>

      <div className="h-[42rem]">
        <DataGrid instance={grid} />
      </div>
    </section>
  );
};

export default RombergDeviceLogsPage;

const cols: ColumnDef<UnitLog>[] = [
  {
    accessorKey: "fecha_subida",
    accessorFn: (row) => format(parseISO(row.fecha_subida), "Pp"),
    header: "Fecha de subida",
    columnTitle: "Fecha de subida",
    minSize: 200,
    //enableSorting: true,
    filterVariant: "datetime-range",
    enableMultiSort: true,
  },
  {
    accessorKey: "timestamp",
    accessorFn: (row) => format(parseISO(row.timestamp), "Pp"),
    header: "Fecha de generación",
    columnTitle: "Timestamp",
    minSize: 200,
    //enableSorting: true,
    filterVariant: "datetime-range",
    enableMultiSort: true,
  },
  {
    accessorKey: "tipo",
    accessorFn: (row) => row.tipo,
    header: "Tipo",
    columnTitle: "Tipo",
    minSize: 150,
    enableSorting: true,
    //filterVariant: "datetime-range",
  },
  {
    accessorKey: "log",
    accessorFn: (row) => row.log,
    header: "Log",
    columnTitle: "Log",
    minSize: 700,
    enableSorting: true,
    //filterVariant: "datetime-range",
  },
];

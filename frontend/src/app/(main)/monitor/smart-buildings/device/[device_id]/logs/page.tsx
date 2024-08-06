"use client";

import {
  useDeviceLogsQuery,
  useDeviceStatusQuery,
  useSBDeviceLogsQuery,
  useSBDeviceStatusQuery,
} from "@/api/queries/monitor";
import { DeviceLog } from "@/api/services/monitor/types";
import Breadcrumbs from "@/app/(main)/monitor/(components)/Breadcrumbs";
import { useDataGrid, useSsrDataGrid } from "@/hooks/data-grid";
import DataGrid from "@/ui/data-grid/DataGrid";
import { ColumnDef } from "@/ui/data-grid/types";
import { Checkbox } from "@mantine/core";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SBDeviceLogsPage = ({ params }: { params: { device_id: string } }) => {
  const router = useRouter();
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

  const deviceStatusQuery = useSBDeviceStatusQuery({
    variables: {
      device_id: params.device_id,
    },
  });

  const deviceStatus = deviceStatusQuery.data;

  const deviceLogsQuery = useSBDeviceLogsQuery({
    variables: {
      device_id: params.device_id,
      show_empty: showEmpty,
      ...queryVariables,
    },
  });

  const grid = useDataGrid<DeviceLog>({
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
      <div className="mb-6">
        {deviceStatus && (
          <Breadcrumbs
            links={[
              { href: "/monitor/smart-buildings/", name: "Smart Buildings" },
              {
                href: `/monitor/smart-buildings/device/${params.device_id}/`,
                name: deviceStatus?.device_description
                  ? deviceStatus.device_description
                  : deviceStatus?.device_name.replace("_", " "),
              },
            ]}
            pageName="Logs"
          ></Breadcrumbs>
        )}
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

export default SBDeviceLogsPage;

const cols: ColumnDef<DeviceLog>[] = [
  {
    accessorKey: "device",
    accessorFn: (row) => row.device,
    header: "Device",
    columnTitle: "Device",
    minSize: 150,
    enableSorting: true,
    //filterVariant: "datetime-range",
    enableMultiSort: true,
  },
  {
    accessorKey: "register_time",
    accessorFn: (row) => format(parseISO(row.register_time), "Pp"),
    header: "Register time",
    columnTitle: "Register time",
    minSize: 250,
    enableSorting: true,
    filterVariant: "datetime-range",
    enableMultiSort: true,
  },
  {
    accessorKey: "log_time",
    accessorFn: (row) => format(parseISO(row.log_time), "Pp"),
    header: "Log time",
    columnTitle: "Log time",
    minSize: 250,
    enableSorting: false,
    //filterVariant: "datetime-range",
    //enableMultiSort: true,
  },
  {
    accessorKey: "log",
    accessorFn: (row) => (row.log == "" ? "Vacío" : row.log),
    header: "Log",
    columnTitle: "Log",
    minSize: 500,
    enableSorting: false,
  },
];

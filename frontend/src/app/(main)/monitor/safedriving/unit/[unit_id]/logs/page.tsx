"use client";

import { useUnitLogsQuery, useUnitStatusQuery } from "@/api/queries/monitor";
import { UnitLogs } from "@/api/services/monitor/types";
import { useDataGrid, useSsrDataGrid } from "@/hooks/data-grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { ColumnDef } from "@/ui/data-grid/types";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import DataGrid from "@/ui/data-grid/DataGrid";
import { useRouter } from "next/navigation";

const UnitLogsPage = ({ params }: { params: { unit_id: string } }) => {
  const router = useRouter();

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

  const unitStatusQuery = useUnitStatusQuery({
    variables: {
      unit_id: params.unit_id,
    },
  });

  const unitStatus = unitStatusQuery.data;

  const unitLogsQuery = useUnitLogsQuery({
    variables: {
      unit_id: params.unit_id,
      ...queryVariables,
    },
  });

  const grid = useDataGrid<UnitLogs>({
    data: unitLogsQuery.data?.data || [],
    columns: cols,
    rowNumberingMode: "static",
    enableRowNumbering: true,
    disableCellSelectionOnClick: true,

    initialState: {
      density: "compact",
    },
    state: {
      loading: unitLogsQuery.isLoading || unitLogsQuery.isFetching,
      ...dataGridState,
    },
    enableColumnResizing: true,
    hideColumnFooters: true,
    enableColumnActions: true,

    ...(dataGridConfig as any),
    enableMultiSort: true,
    pageCount: unitLogsQuery.data?.pagination?.pages ?? 0,
    rowCount: unitLogsQuery.data?.pagination?.count ?? 0,
  });

  return (
    <section className="relative">
      <button
        className="absolute hidden lg:block right-full mr-5 mt-2 opacity-40"
        onClick={() => router.back()}
      >
        <ArrowBackIcon />
      </button>

      <div className="text-5xl mb-6">
        <h1>
          <span className="font-bold">
            {unitStatus?.client == "Transpais" ? "Unidad" : ""}{" "}
            {unitStatus?.unit}
          </span>
          <span className="opacity-40"> - Logs</span>
        </h1>
      </div>
      <div className="h-[42rem]">
        <DataGrid instance={grid} />
      </div>
    </section>
  );
};

export default UnitLogsPage;

const cols: ColumnDef<UnitLogs>[] = [
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

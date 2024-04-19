"use client";

import { useUnitHistoryQuery } from "@/api/queries/monitor";
import { UnitHistory, UnitLogs } from "@/api/services/monitor/types";
import { ColumnDef } from "@/ui/data-grid/types";
import { format, parseISO } from "date-fns";
import { UnitLogsPage } from "./UnitLogsPage";

export default UnitLogsPage;

export const cols: ColumnDef<UnitLogs>[] = [
  {
    accessorKey: "fecha_subida",
    accessorFn: (row) => format(parseISO(row.fecha_subida), "Pp"),
    header: "Fecha",
    columnTitle: "Fecha",
    minSize: 200,
    //enableSorting: true,
    filterVariant: "datetime-range",
    enableMultiSort: true,
  },
  {
    accessorKey: "timestamp",
    accessorFn: (row) => format(parseISO(row.timestamp), "Pp"),
    header: "Fecha",
    columnTitle: "Fecha",
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

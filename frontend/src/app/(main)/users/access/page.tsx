"use client";

import { parseISO, parse, format as formatDate } from "date-fns";
import { useQueryState } from "@/hooks/shared";
import { useEffect, useState } from "react";
import { useImmer } from "use-immer";

import { DatePicker } from "@/components/shared/mui.old/hook-form/styled";
import { User } from "@/api/auth.types";
import { UserAccess } from "@/api/users.types";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useUsersAccessQuery } from "@/api/queries/users";
import { ColumnDef } from "@/components/ui/data-grid/types";
import { es } from "@/components/ui/data-grid/locales/es";
import DataGrid from "@/components/ui/data-grid/DataGrid";
import useDataGrid from "@/components/ui/data-grid/useDataGrid";
import { PaginationState } from "@tanstack/react-table";

function localDatetimeToLocalDateStr(datetime: Date | null) {
  return datetime ? formatDate(datetime, "yyyy-MM-dd") : "";
}

function dateRangeStart(date: Date | null) {
  let newDate = date;
  if (date) {
    newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
  }
  return newDate;
}

function dateRangeEnd(date: Date | null) {
  let newDate = date;
  if (date) {
    newDate = new Date(date);
    newDate.setHours(23, 59, 59, 999);
  }
  return newDate;
}

function dateStrToDatetime(dateStr: string, range?: "start" | "end") {
  let date: Date | null = parse(dateStr, "yyyy-MM-dd", new Date());

  if (range === "start") {
    date = dateRangeStart(date);
  } else if (range === "end") {
    date = dateRangeEnd(date);
  }

  return date ?? new Date();
}

const UsersAccessPage = () => {
  const aMonthAgo = new Date();
  aMonthAgo.setDate(aMonthAgo.getDate() - 30);
  aMonthAgo.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const usersAccessQueryParams = useQueryState({
    page: {
      defaultValue: 0,
      parse: (value) => parseInt(value),
      serialize: (value) => value.toString(),
    },
    page_size: {
      defaultValue: 25,
      parse: (value) => parseInt(value),
      serialize: (value) => value.toString(),
    },
    start_date: {
      defaultValue: aMonthAgo,
      parse: (value) => dateStrToDatetime(value, "start"),
      serialize: (value) => localDatetimeToLocalDateStr(value),
    },
    end_date: {
      defaultValue: today,
      parse: (value) => dateStrToDatetime(value, "end"),
      serialize: (value) => localDatetimeToLocalDateStr(value),
    },
  });
  const [dates, setDates] = useState<{ startDate: Date | null; endDate: Date | null; }>({
    startDate: usersAccessQueryParams.state.start_date,
    endDate: usersAccessQueryParams.state.end_date,
  });
  const [filters, setFilters] = useImmer<{  
    search?: string;
  }>({});
  const usersAccessQuery = useUsersAccessQuery({
    variables: {
      pagination: {
        page: usersAccessQueryParams.state.page + 1,
        page_size: usersAccessQueryParams.state.page_size,
      },
      filters: {
        start_date: usersAccessQueryParams.state.start_date.toISOString(),
        end_date: usersAccessQueryParams.state.end_date.toISOString(),
        sort: "-user",
        ...filters,
      }
    },
  });
  const grid = useDataGrid<UserAccess>({
    data: usersAccessQuery.data?.data || [],
    columns: cols,
    localization: es,
    initialState: {
      density: "compact",
    },
    state: {
      loading: usersAccessQuery.isLoading || usersAccessQuery.isFetching,
      pagination: {
        pageIndex: usersAccessQueryParams.state.page - 1,
        pageSize: usersAccessQueryParams.state.page_size,
      },
      globalFilter: filters?.search,
    },
    classNames: {
      root: "h-full !border-none text-neutral-800",
      mainContainer: "rounded shadow-md bg-white",
      footerContainer: "!border-none bg-white",
      columnHeadersCell: {
        root: "text-white font-bold",
        actions: "bg-white !text-white",
        label: "!font-normal !text-sm",
      },
      columnHeaders: {
        root: "bg-neutral-800",
      },
      row: {
        root: "border-b border-neutral-200",
      },
      toolbarContainer: "justify-end text-neutral-800",
      footer: {
        root: "pt-1",
      }
    },
    globalFilterFn: "fuzzy",
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    hideColumnFooters: true,
    // enableSorting: true,

    enableFilters: true,
    manualFiltering: true,
    enableGlobalFilter: true,
    globalFilterDebounceTime: 1000,
    onGlobalFilterChange: (value) => {
      const newValue = typeof value === "function" ? value(filters?.search) : value;
      setFilters(draft => {
        draft.search = newValue;
      });
    },

    enablePagination: true,
    manualPagination: true,
    pageSizeOptions: [1, 25, 50, 100],
    pageCount: usersAccessQuery.data?.pagination?.pages ?? 0,
    rowCount: usersAccessQuery.data?.pagination?.count ?? 0,
    onPaginationChange: (value) => {
      const old: PaginationState = {
        pageIndex : usersAccessQueryParams.state.page - 1,
        pageSize  : usersAccessQueryParams.state.page_size,
      };
      const newValue = typeof value === "function" ? value(old) : value;
      usersAccessQueryParams.update({
        page: newValue.pageIndex + 1,
        page_size: newValue.pageSize,
      });
    },
    
    slotProps: {
      baseTextInputProps: {
        classNames: {
          input: "rounded-none border-t-0 border-l-0 border-r-0 border-b border-b-2 border-neutral-600 hover:border-blue-500 focus:border-blue-500"
        },
      },
    },
  });

  //* Prefetch adjacent pages
  useEffect(() => {
    if (usersAccessQuery.data && usersAccessQuery.data.pagination && !usersAccessQuery.isPreviousData) {
      const paginationInfo = usersAccessQuery.data.pagination;
      if (paginationInfo.page > 1) {
        useUsersAccessQuery.prefetch({
          variables: {
            filters: usersAccessQuery.variables.filters,
            pagination: {
              page: paginationInfo.page - 1,
              page_size: usersAccessQuery.variables.pagination?.page_size,
            }
          },
          staleTime: 5 * 60 * 1000,
        });
      }
      if (paginationInfo.page < paginationInfo.pages) {
        useUsersAccessQuery.prefetch({
          variables: {
            filters: usersAccessQuery.variables.filters,
            pagination: {
              page: paginationInfo.page + 1,
              page_size: usersAccessQuery.variables.pagination?.page_size,
            }
          },
          staleTime: 5 * 60 * 1000,
        });
      }
    }
  }, [usersAccessQuery.data, usersAccessQuery.isPreviousData, usersAccessQuery.variables.filters, usersAccessQuery.variables.pagination?.page_size]);

  return (
    <section className="flex flex-col h-full lg:container mx-auto pb-2 md:pb-6 px-2 md:px-4 lg:px-0">
      <div className="flex flex-col md:flex-row items-center">
        <h1 className="text-3xl font-bold py-2 md:flex-1">
          Acceso de Usuarios
        </h1>

        <div className="text-neutral-800 self-end">
          <DatePicker<true>
            selectsRange
            startDate={dates.startDate}
            endDate={dates.endDate}
            onChange={([sd, ed]) => {
              setDates({ startDate: sd, endDate: ed });
            }}
            onCalendarClose={() => {
              usersAccessQueryParams.update({
                start_date: dateRangeStart(dates.startDate),
                end_date: dateRangeEnd(dates.endDate ?? dates.startDate),
              });
            }}
          />
        </div>
      </div>

      <div className="flex-[1_0_0] overflow-y-hidden pb-1 pr-1">
        <DataGrid instance={grid} />
      </div>
    </section>
  );
};

export default UsersAccessPage;

const cols: ColumnDef<UserAccess>[] = [
  {
    id: "avatar",
    accessorKey: "user",
    header: "",
    columnTitle: "Avatar",
    size: 48,
    cell: ({ cell, row, getValue }) => getValue<User | null>() ? (
      <UserAvatar
        user={getValue<User>()}
        size="sm"
      />
    ) : null,
  },
  {
    id: "user.name",
    accessorKey: "user",
    header: "Nombre",
    columnTitle: "Nombre",
    size: 250,
    cell: ({ getValue }) => getValue<User | null>() 
      ? `${getValue<User>().first_name ?? ""} ${getValue<User>().last_name ?? ""}`
      : "No registrado",
  },
  {
    accessorKey: "user.email",
    header: "Email",
    columnTitle: "Email",
    size: 250,
    cell: ({ getValue }) => getValue<string>() ?? "N/A",
  },
  {
    accessorKey: "last_access",
    header: "Último acceso",
    columnTitle: "Último acceso",
    size: 200,
    cell: ({ getValue }) => formatDate(parseISO(getValue<string>()), "P"),
  },
  {
    accessorKey: "access",
    header: "Accesos",
    columnTitle: "Accesos",
    size: 150,
  },
];

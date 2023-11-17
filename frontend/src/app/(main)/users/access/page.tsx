"use client";

import { parseISO, parse, format as formatDate } from "date-fns";
import { useQueryState } from "@/hooks/shared";
import { useEffect, useState } from "react";
import { useImmer } from "use-immer";

import { DatePickerInput, DateRangePresets } from "@/ui/dates";
import { User } from "@/api/auth.types";
import { UserAccess } from "@/api/users.types";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useUsersAccessQuery } from "@/api/queries/users";
import { ColumnDef } from "@/ui/data-grid/types";
import { es } from "@/ui/data-grid/locales/es";
import DataGrid from "@/ui/data-grid/DataGrid";
import { useDataGrid } from "@/hooks";
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
      defaultValue: 1,
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
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [dates, setDates] = useState<{ startDate: Date | null; endDate: Date | null; }>({
    startDate: usersAccessQueryParams.state.start_date,
    endDate: usersAccessQueryParams.state.end_date,
  });
  const [filters, setFilters] = useImmer<{  
    search?: string;
  }>({
    search: "",
  });
  const usersAccessQuery = useUsersAccessQuery({
    variables: {
      pagination: {
        page: usersAccessQueryParams.state.page,
        page_size: usersAccessQueryParams.state.page_size,
      },
      filters: {
        start_date: usersAccessQueryParams.state.start_date.toISOString(),
        end_date: usersAccessQueryParams.state.end_date.toISOString(),
        sort: "-user",
        ...filters,
      },
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
    enableColumnResizing: true,
    hideColumnFooters: true,
    enableColumnActions: true,
    enableSorting: false,

    enableFilters: true,
    manualFiltering: true,
    onGlobalFilterChange: (value) => {
      const newValue = typeof value === "function" ? value(filters?.search) : value;
      setFilters(draft => {
        draft.search = newValue;
      });
    },

    enablePagination: true,
    manualPagination: true,
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

  const setQueryDates = (startDate: Date | null, endDate: Date | null) => {
    usersAccessQueryParams.update({
      start_date: dateRangeStart(startDate),
      end_date: dateRangeEnd(endDate ?? startDate),
    });
  };

  return (
    <section className="flex flex-col h-full lg:container mx-auto pb-2 md:pb-6 px-2 md:px-4 lg:px-0">
      <div className="flex flex-col md:flex-row items-center">
        <h1 className="text-3xl font-bold py-2 md:flex-1">
          Acceso de Usuarios
        </h1>

        <div className="text-neutral-800 self-end">
          <DatePickerInput
            type="range"
            value={[dates.startDate, dates.endDate]}
            onChange={([sd, ed]) => {
              setDates({ startDate: sd, endDate: ed });
              if (sd && ed) setCalendarOpen(false);
            }}
            onClick={() => setCalendarOpen(true)}
            popoverProps={{
              opened: calendarOpen,
              onClose: () => {
                setCalendarOpen(false);
                if (dates.startDate && !dates.endDate)
                  setDates({ startDate: dates.startDate, endDate: dates.startDate });
                
                setQueryDates(dates.startDate, dates.endDate);
              },
            }}
            rightSection={
              <DateRangePresets 
                onPresetClick={([sd, ed]) => {
                  setDates({ startDate: sd, endDate: ed });
                  setQueryDates(sd, ed);
                }} 
                actionIconProps={{
                  variant: "subtle",
                  color: "gray",
                }}
                iconProps={{
                  className: "!w-5 !h-5"
                }}
              />
            }
            rightSectionPointerEvents="auto"
            allowSingleDateInRange
          />
        </div>
      </div>

      <div className="flex-[1_0_0] overflow-y-hidden pb-1 pr-1 pl-1">
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
    cell: ({ getValue }) => getValue<User | null>() ? (
      <UserAvatar
        user={getValue<User>()}
        size="sm"
      />
    ) : null,
    enableResizing: false,
  },
  {
    id: "user.name",
    accessorKey: "user",
    header: "Nombre",
    columnTitle: "Nombre",
    minSize: 250,
    flex: 1,
    cell: ({ getValue }) => getValue<User | null>() 
      ? `${getValue<User>().first_name ?? ""} ${getValue<User>().last_name ?? ""}`
      : "No registrado",
  },
  {
    accessorKey: "user.email",
    header: "Email",
    columnTitle: "Email",
    minSize: 250,
    flex: 1,
    cell: ({ getValue }) => getValue<string>() ?? "N/A",
  },
  {
    accessorKey: "last_access",
    header: "Último acceso",
    columnTitle: "Último acceso",
    minSize: 200,
    flex: 1,
    cell: ({ getValue }) => formatDate(parseISO(getValue<string>()), "P"),
  },
  {
    accessorKey: "access",
    header: "Accesos",
    columnTitle: "Accesos",
    size: 100,
  },
];

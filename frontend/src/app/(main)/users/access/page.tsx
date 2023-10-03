"use client";

import { GridCallbackDetails, GridColDef, GridFilterModel } from "@mui/x-data-grid";
import { parseISO, parse, format as formatDate } from "date-fns";
import { useDebounce, useQueryState } from "@/hooks/shared";
import { useEffect, useState } from "react";

import { DataGrid, GridToolbarWithSearch } from "@/components/shared/DataGrid";
import { DatePicker } from "@/components/shared/mui.old/hook-form/styled";
import { User } from "@/api/auth.types";
import { UserAccess } from "@/api/users.types";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useUsersAccessQuery } from "@/api/queries/users";

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
  const [filters, setFilters] = useState<{  
    search?: string;
  } | undefined>();
  const debounceFilters = useDebounce({
    callback: (newFilters: typeof filters) => {
      setFilters(newFilters);
    },
    debounceTime: 1000,
  });
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

  const onFilterModelChange = (model: GridFilterModel, details: GridCallbackDetails<"filter">) => {
    debounceFilters({
      search: model.quickFilterValues?.[0] || undefined,
    });
  };

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
        <DataGrid
          rows={usersAccessQuery.data?.data || []}
          columns={cols}
          loading={usersAccessQuery.isLoading || usersAccessQuery.isFetching}
          disableColumnMenu
          rowSelection={false}
          className="h-full"
          
          pagination
          paginationMode="server"
          paginationModel={{
            page: usersAccessQueryParams.state.page,
            pageSize: usersAccessQueryParams.state.page_size,
          }}
          onPaginationModelChange={(model) => usersAccessQueryParams.update({
            page: model.page,
            page_size: model.pageSize,
          })}
          pageSizeOptions={[25, 50, 100]}
          rowCount={usersAccessQuery.data?.pagination?.count || 0}

          filterMode="server"
          onFilterModelChange={onFilterModelChange}
          slots={{
            toolbar: GridToolbarWithSearch,
          }}
          disableDensitySelector
          disableColumnFilter
          disableColumnSelector
        />
      </div>
    </section>
  );
};

export default UsersAccessPage;
  
const cols: GridColDef<UserAccess>[] = [
  {
    field: "avatar",
    headerName: "Avatar",
    renderHeader: () => null,
    width: 32,
    renderCell: params => params.row.user ? (
      <UserAvatar
        user={params.row.user as User}
        size="sm"
      />
    ) : null,
  },
  {
    field: "user.name",
    headerName: "Nombre",
    minWidth: 200,
    flex: 1,
    sortable: true,
    valueGetter: params => params.row.user
      ? `${params.row.user.first_name ?? ""} ${params.row.user.last_name ?? ""}`
      : "No registrado",
  },
  {
    field: "user.email",
    headerName: "Email",
    minWidth: 200,
    flex: 1,
    sortable: true,
    valueGetter: params => params.row.user?.email ?? "N/A",
  },
  {
    field: "last_access",
    headerName: "Último acceso",
    minWidth: 200,
    flex: 1,
    sortable: true,
    valueFormatter: params => formatDate(parseISO(params.value), "P"),
    type: "date",
  },
  {
    field: "access",
    headerName: "Accesos",
    minWidth: 150,
    flex: 1,
    sortable: true,
  },
];

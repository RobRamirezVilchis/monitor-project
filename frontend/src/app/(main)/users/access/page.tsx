"use client";

import { GridCallbackDetails, GridColDef, GridFilterModel } from "@mui/x-data-grid";
import { useDebounce, useQueryState } from "@/hooks/shared";
import { parseISO, format as formatDate } from "date-fns";

import { useUsersAccessQuery } from "@/api/queries/users";
import { UserAccess } from "@/api/users.types";
import { DataGrid, GridToolbarWithSearch } from "@/components/shared/DataGrid";
import { DatePicker } from "@/components/shared/hook-form/styled";
import { User } from "@/api/auth.types";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useState } from "react";

function datetimeToDateStr(datetime: Date | null) {
  const iso = datetime?.toISOString();
  return iso?.substring(0, iso?.indexOf("T") ?? undefined) ?? "";
}

function dateStrToDatetime(dateStr: string) {
  return dateStr ? parseISO(dateStr) : null;
}

const UsersAccessPage = () => {
  const aMonthAgo = new Date();
  aMonthAgo.setMonth(aMonthAgo.getMonth() - 1);
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
      defaultValue: datetimeToDateStr(aMonthAgo),
    },
    end_date: {
      defaultValue: datetimeToDateStr(new Date()),
    },
  });
  const [dates, setDates] = useState({
    startDate: dateStrToDatetime(usersAccessQueryParams.state.start_date),
    endDate: dateStrToDatetime(usersAccessQueryParams.state.end_date),
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
        start_date: usersAccessQueryParams.state.start_date,
        end_date: usersAccessQueryParams.state.end_date,
        sort: "-user",
        ...filters,
      }
    },
  });

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
                start_date: datetimeToDateStr(dates.startDate),
                end_date: datetimeToDateStr(dates.endDate ?? dates.startDate),
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
        className="!w-8 !h-8 !text-base"
      />
    ) : null,
    type: "actions",
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
    valueFormatter: params => datetimeToDateStr(dateStrToDatetime(params.value)),
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

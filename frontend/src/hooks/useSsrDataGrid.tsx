import { UseCreatedQuery, UseCreatedQueryResult } from "@/api/helpers/createQuery";
import { OptionallyPaginated, Paginated, isPaginated } from "@/api/types";
import { QueryKey } from "@tanstack/react-query";
import { Prettify } from "@/utils/types";

export interface UseSsrDataGridOptions<TVariables, TQueryFnData, TData, TError> {
  query: UseCreatedQueryResult<TVariables, TQueryFnData, TData, TError>;
  
}

type InnerType<T> = T extends Paginated<infer S> ? S : never;

export const useSsrDataGrid = <TVariables, TQueryFnData extends OptionallyPaginated<unknown>, TData, TError, T = InnerType<TQueryFnData>>(
  options: UseSsrDataGridOptions<TVariables, TQueryFnData, TData, TError>
) => {
  
  // if (options.query.data && isPaginated(options.query.data as OptionallyPaginated<T>))
  //   return {};
  // else
  //   return {};
}

export interface UseDataGridSsrFiltersOptions<Filters, PageName extends string = "page", PageSizeName extends string = "page_size"> {
  pageParamName?: PageName;
  pageSizeParamName?: PageSizeName;
  defaultValues?: Prettify<Partial<Filters & { [Key in PageName | PageSizeName]: number; }>>;
}

export const useDataGridSsrFilters = <
  Filters,
  PageName extends string = "page", 
  PageSizeName extends string = "page_size", 
  Pagination = { [Key in PageName | PageSizeName]: number }
>({
  pageParamName = "page" as PageName,
  pageSizeParamName = "page_size" as PageSizeName,
}: UseDataGridSsrFiltersOptions<Filters, PageName, PageSizeName>) => {
  const queryParams = useQueryState({
    [pageParamName  as PageName]: {
      defaultValue: 1,
      parse: (value) => parseInt(value),
      serialize: (value) => value.toString(),
    },
    [pageSizeParamName as PageSizeName]: {
      defaultValue: 25,
      parse: (value) => parseInt(value),
      serialize: (value) => value.toString(),
    },
  });
  const [sortingState, setSortingState] = useState<SortingState>([]);
  const [state, setState] = useImmer<{}>({});

  return {
    queryVariables: {
      ...queryParams.state,
      ...state,
      sort: sortingState.map(x => `${x.desc ? "-" : ""}${x.id}`).join(","),
    } as Prettify<Pagination & Filters & { sort: string; }>,
    config: {
      enableSorting: true,
      manualSorting: true,
      onSortingChange: (value: any) => {
        const newValue = typeof value === "function" ? value(sortingState) : value;
        setSortingState(newValue);
      },
   
      enableFilters: true,
      manualFiltering: true,
      onGlobalFilterChange: (value: any) => {
        const newValue = typeof value === "function" ? value(state) : value;
        setState(draft => {
          draft = newValue;
        });
      },
  
      enablePagination: true,
      manualPagination: true,
      pageCount: usersQuery.data?.pagination?.pages ?? 0,
      rowCount: usersQuery.data?.pagination?.count ?? 0,
      onPaginationChange: (value) => {
        const old: PaginationState = {
          pageIndex :pagination.state.page - 1,
          pageSize  :pagination.state.page_size,
        };
        const newValue = typeof value === "function" ? value(old) : value;
        pagination.update({
          page: newValue.pageIndex + 1,
          page_size: newValue.pageSize,
        });
      },
    }
  }
}

// ----------------------------------------------------------------------------

export const useUsersQuery = createQuery({
  queryPrimaryKey: "users",
  queryKeyVariables: (vars: UsersFilters) => vars ? [vars] : [],
  queryFn: async (ctx, vars) => await ({}) as unknown as OptionallyPaginated<User>,
});

import { createQuery } from "@/api/helpers/createQuery";
import { useEffect, useState } from "react";
import { Button, Modal } from "@mantine/core";
import { PaginationState, SortingState } from "@tanstack/react-table";
import { useImmer } from "use-immer";

import { DeleteUserAction, SendPasswordChangeAction, UpdateUserAction } from "@/app/(main)/users/(main)/Actions";
import { UserForm } from "@/app/(main)/users/(main)/UserForm";
import { User } from "@/api/services/auth/types"; 
import { showSuccessNotification, showErrorNotification } from "@/ui/notifications";
import { useQueryState } from "@/hooks/shared";
import { getUserRoleLocalized } from "@/api/services/users";
import { ColumnDef } from "@/ui/data-grid/types";
import { useDataGrid } from "@/hooks/useDataGrid";
import { useCreateUserMutation } from "@/api/mutations/users";
import DataGrid from "@/ui/data-grid/DataGrid";

import { IconPlus } from "@tabler/icons-react";
import { withAuth } from "@/components/auth/withAuth";
import { UsersFilters } from "@/api/services/users/types";

const UsersPage = () => {
  const f = useDataGridSsrFilters<{ sort: string; }>({
    defaultValues: {
      sort: "first_name",
    }
  });

  const pagination = useQueryState({
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
  });
  const [sortingState, setSortingState] = useState<SortingState>([{ id: "first_name", desc: false }]);
  const [filters, setFilters] = useImmer<{  
    search?: string;
  }>({
    search: "",
  });
  const usersQuery = useUsersQuery({
    variables: {
      page: pagination.state.page,
      page_size: pagination.state.page_size,
      ...filters,
      sort: sortingState.map(x => `${x.desc ? "-" : ""}${x.id}`).join(","),
    },
    refetchOnWindowFocus: false,
    select: data => data as Paginated<User>,
  });

  // const { queryVariables: { page: asdas } } = useSsrDataGrid({
  //   query: usersQuery,
  // });

  
  const grid = useDataGrid<User>({
    data: usersQuery.data 
      ? (isPaginated(usersQuery.data) ? usersQuery.data?.data : usersQuery.data)
      : [],
    columns: cols,
    rowNumberingMode: "static",
    enableRowNumbering: true,
    disableCellSelectionOnClick: true,
    initialState: {
      density: "compact",
    },
    state: {
      loading: usersQuery.isLoading || usersQuery.isFetching,
      pagination: {
        pageIndex: pagination.state.page - 1,
        pageSize: pagination.state.page_size,
      },
      globalFilter: filters?.search,
      sorting: sortingState,
    },
    enableColumnResizing: true,
    hideColumnFooters: true,
    enableColumnActions: true,

    enableSorting: true,
    manualSorting: true,
    onSortingChange: (value) => {
      const newValue = typeof value === "function" ? value(sortingState) : value;
      setSortingState(newValue);
    },
 
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
    pageCount: usersQuery.data?.pagination?.pages ?? 0,
    rowCount: usersQuery.data?.pagination?.count ?? 0,
    onPaginationChange: (value) => {
      const old: PaginationState = {
        pageIndex :pagination.state.page - 1,
        pageSize  :pagination.state.page_size,
      };
      const newValue = typeof value === "function" ? value(old) : value;
      pagination.update({
        page: newValue.pageIndex + 1,
        page_size: newValue.pageSize,
      });
    },
  });

  //* Prefetch adjacent pages
  useEffect(() => {
    if (usersQuery.data && usersQuery.data.pagination && !usersQuery.isPreviousData) {
      const paginationInfo = usersQuery.data.pagination;
      if (paginationInfo.page > 1) {
        useUsersQuery.prefetch({
          variables: {
            ...usersQuery.variables,
            page: paginationInfo.page - 1,
            page_size: usersQuery.variables.page_size,
          },
          staleTime: 5 * 60 * 1000,
        });
      }
      if (paginationInfo.page < paginationInfo.pages) {
        useUsersQuery.prefetch({
          variables: {
            ...usersQuery.variables,
            page: paginationInfo.page + 1,
            page_size: usersQuery.variables.page_size,
          },
          staleTime: 5 * 60 * 1000,
        });
      }
    }
  }, [usersQuery.data, usersQuery.isPreviousData, usersQuery.variables]);

  return (
    <DataGrid instance={grid} />
  );
};

export default withAuth(UsersPage, {
  rolesWhitelist: ["Admin"],
});
  
const cols: ColumnDef<User>[] = [
  {
    id: "first_name",
    accessorFn: (row) => `${row.first_name} ${row.last_name}`,
    header: "Nombre",
    columnTitle: "Nombre",
    minSize: 250,
    flex: 1,
  },
  {
    accessorKey: "email",
    header: "Email",
    columnTitle: "Email",
    minSize: 250,
    flex: 1,
  },
  {
    accessorKey: "roles",
    accessorFn: (row) => row.roles.map(role => getUserRoleLocalized(role)).join(", "),
    header: "Roles",
    columnTitle: "Roles",
    minSize: 350,
    enableSorting: false,
  },
  {
    id: "actions",
    header: "",
    columnTitle: "Acciones",
    size: 140,
    cellClassNames: {
      content: "flex w-full justify-center items-center h-full",
    },
    cell: ({ row }) => (
      <div className="flex items-center gap-4 h-full w-full px-1">
        <UpdateUserAction user={row.original} />
        <DeleteUserAction user={row.original} />
        { !row.original.verified ? <SendPasswordChangeAction user={row.original} /> : null }
      </div>
    ),
    enableResizing: false,
  },
];

"use client";

import { useEffect, useState } from "react";
import { Button, Modal } from "@mantine/core";
import { PaginationState, SortingState } from "@tanstack/react-table";
import { useImmer } from "use-immer";

import { DeleteUserAction, SendPasswordChangeAction, UpdateUserAction } from "./Actions";
import { UserForm } from "./UserForm";
import { User } from "@/api/services/auth/types"; 
import { showSuccessNotification, showErrorNotification } from "@/ui/notifications";
import { useQueryState } from "@/hooks/shared";
import { useUsersQuery } from "@/api/queries/users";
import { getUserRoleLocalized } from "@/api/services/users";
import { ColumnDef } from "@/ui/data-grid/types";
import { useDataGrid } from "@/hooks/useDataGrid";
import { useCreateUserMutation } from "@/api/mutations/users";
import DataGrid from "@/ui/data-grid/DataGrid";

import { IconPlus } from "@tabler/icons-react";
import { withAuth } from "@/components/auth/withAuth";

import { useDataGridSsrFilters, usePrefetchPaginatedAdjacentQuery } from "@/hooks/useSsrDataGrid";

const UsersPage = () => {
  const {
    state: ssrState,
    dataGridConfig: ssrDataGridConfig,
    queryVariables: ssrQueryVariables,
  } = useDataGridSsrFilters({});

  // const pagination = useQueryState({
  //   page: {
  //     defaultValue: 1,
  //     parse: (value) => parseInt(value),
  //     serialize: (value) => value.toString(),
  //   },
  //   page_size: {
  //     defaultValue: 25,
  //     parse: (value) => parseInt(value),
  //     serialize: (value) => value.toString(),
  //   },
  // });
  // const [sortingState, setSortingState] = useState<SortingState>([{ id: "first_name", desc: false }]);
  // const [filters, setFilters] = useImmer<{  
  //   search?: string;
  // }>({
  //   search: "",
  // });
  const usersQuery = useUsersQuery({
    // variables: {
    //   page: pagination.state.page,
    //   page_size: pagination.state.page_size,
    //   ...filters,
    //   sort: sortingState.map(x => `${x.desc ? "-" : ""}${x.id}`).join(","),
    // },
    variables: ssrQueryVariables,
    refetchOnWindowFocus: false,
  });
  usePrefetchPaginatedAdjacentQuery({
    query: usersQuery,
    options: {
      staleTime: 5 * 60 * 1000,
    },
  });

  const createUserMutation = useCreateUserMutation({
    onSuccess: () => {
      showSuccessNotification({
        message: "Usuario agregado correctamente.",
      });
      setNewUserFormOpen(false);
    },
    onError: () => showErrorNotification({
      message: "Error al agregar el usuario.",
    }),
  });
  const [newUserFormOpen, setNewUserFormOpen] = useState(false);
  const grid = useDataGrid<User>({
    data: usersQuery.data?.data || [],
    columns: cols,
    rowNumberingMode: "static",
    enableRowNumbering: true,
    disableCellSelectionOnClick: true,
    initialState: {
      density: "compact",
    },
    state: {
      loading: usersQuery.isLoading || usersQuery.isFetching,
      // pagination: {
      //   pageIndex: pagination.state.page - 1,
      //   pageSize: pagination.state.page_size,
      // },
      // globalFilter: filters?.search,
      // sorting: sortingState,
      ...ssrState,
    },
    enableColumnResizing: true,
    hideColumnFooters: true,
    enableColumnActions: true,

    // enableSorting: true,
    // manualSorting: true,
    // onSortingChange: (value) => {
    //   const newValue = typeof value === "function" ? value(sortingState) : value;
    //   setSortingState(newValue);
    // },
 
    // enableFilters: true,
    // manualFiltering: true,
    // onGlobalFilterChange: (value) => {
    //   const newValue = typeof value === "function" ? value(filters?.search) : value;
    //   setFilters(draft => {
    //     draft.search = newValue;
    //   });
    // },

    // enablePagination: true,
    // manualPagination: true,
    // pageCount: usersQuery.data?.pagination?.pages ?? 0,
    // rowCount: usersQuery.data?.pagination?.count ?? 0,
    // onPaginationChange: (value) => {
    //   const old: PaginationState = {
    //     pageIndex :pagination.state.page - 1,
    //     pageSize  :pagination.state.page_size,
    //   };
    //   const newValue = typeof value === "function" ? value(old) : value;
    //   pagination.update({
    //     page: newValue.pageIndex + 1,
    //     page_size: newValue.pageSize,
    //   });
    // },
    ...ssrDataGridConfig,
    pageCount: usersQuery.data?.pagination?.pages ?? 0,
    rowCount: usersQuery.data?.pagination?.count ?? 0,

    pageSizeOptions: [1, 25, 50, 100],
  });

  // //* Prefetch adjacent pages
  // useEffect(() => {
  //   if (usersQuery.data && usersQuery.data.pagination && !usersQuery.isPreviousData) {
  //     console.log("prefetching adjacent pages")
  //     const paginationInfo = usersQuery.data.pagination;
  //     if (paginationInfo.page > 1) {
  //       usersQuery.prefetch({
  //         variables: {
  //           // ...usersQuery.variables,
  //           page: paginationInfo.page - 1,
  //           page_size: usersQuery.variables.page_size,
  //         },
  //         staleTime: 5 * 60 * 1000,
  //       });
  //     }
  //     if (paginationInfo.page < paginationInfo.pages) {
  //       usersQuery.prefetch({
  //         variables: {
  //           // ...usersQuery.variables,
  //           page: paginationInfo.page + 1,
  //           page_size: usersQuery.variables.page_size,
  //         },
  //         staleTime: 5 * 60 * 1000,
  //       });
  //     }
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [usersQuery.prefetch, usersQuery.data, usersQuery.isPreviousData, usersQuery.variables]);

  return (
    <section className="flex flex-col h-full lg:container mx-auto pb-2 md:pb-6">
      <div className="flex items-center">
        <h1 className="text-3xl font-bold py-2 flex-1">
          Usuarios
        </h1>

        <div className="text-neutral-800">
          <Button
            variant="transparent"
            leftSection={<IconPlus className="w-4 h-4" />}
            onClick={() => setNewUserFormOpen(true)}
          >
            Agregar usuario
          </Button>
        </div>
      </div>

      <div className="flex-[1_0_0] min-h-[500px] overflow-y-hidden pb-1 pr-1 pl-1">
        <DataGrid instance={grid} />
      </div>

      <Modal
        opened={newUserFormOpen}
        onClose={() => setNewUserFormOpen(false)}
        size="md"
        centered
        title={<p className="text-xl font-semibold">Agregar usuario</p>}
      >
        <div className="p-4">
          <UserForm 
            onSubmit={values => {
              const payload = {
                ...values,
                username: values.email,
              };
              createUserMutation.mutate(payload);
            }} 
            onCancel={() => setNewUserFormOpen(false)}
            loading={createUserMutation.isLoading}
            submitLabel="Registrar"
            cancelLabel="Cancelar"
            showSendMailField
          />
        </div>
      </Modal>
    </section>
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

"use client";

import { useEffect, useState } from "react";
import { Button, Modal } from "@mantine/core";
import { PaginationState } from "@tanstack/react-table";
import { useImmer } from "use-immer";

import { DeleteUserAction } from "./Actions";
import { NewUserForm } from "./NewUserForm";
import { Role, User } from "@/api/services/auth/types"; 
import { RoleSelector } from "./RoleSelector";
import { showSuccessNotification, showErrorNotification } from "@/ui/notifications";
import { useAddToWhitelistMutation } from "@/api/mutations/users";
import { useQueryState } from "@/hooks/shared";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useWhitelistQuery } from "@/api/queries/users";
import { WhitelistItem } from "@/api/services/users/types";
import { ColumnDef } from "@/ui/data-grid/types";
import DataGrid from "@/ui/data-grid/DataGrid";
import { useDataGrid } from "@/hooks/useDataGrid";

import { IconPlus } from "@tabler/icons-react";

const UsersPage = () => {
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
  const [filters, setFilters] = useImmer<{  
    search?: string;
  }>({
    search: "",
  });
  const usersWhitelistQuery = useWhitelistQuery({
    variables: {
      page: pagination.state.page,
      page_size: pagination.state.page_size,
      ...filters,
      // sort: "-user",
    },
  });
  const addToWhitelistMutation = useAddToWhitelistMutation({
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
  const grid = useDataGrid<WhitelistItem>({
    data: usersWhitelistQuery.data?.data || [],
    columns: cols,
    initialState: {
      density: "compact",
    },
    state: {
      loading: usersWhitelistQuery.isLoading || usersWhitelistQuery.isFetching,
      pagination: {
        pageIndex: pagination.state.page - 1,
        pageSize: pagination.state.page_size,
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
    pageCount: usersWhitelistQuery.data?.pagination?.pages ?? 0,
    rowCount: usersWhitelistQuery.data?.pagination?.count ?? 0,
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
    if (usersWhitelistQuery.data && usersWhitelistQuery.data.pagination && !usersWhitelistQuery.isPreviousData) {
      const paginationInfo = usersWhitelistQuery.data.pagination;
      if (paginationInfo.page > 1) {
        useWhitelistQuery.prefetch({
          variables: {
            ...usersWhitelistQuery.variables,
            page: paginationInfo.page - 1,
            page_size: usersWhitelistQuery.variables.page_size,
          },
          staleTime: 5 * 60 * 1000,
        });
      }
      if (paginationInfo.page < paginationInfo.pages) {
        useWhitelistQuery.prefetch({
          variables: {
            ...usersWhitelistQuery.variables,
            page: paginationInfo.page + 1,
            page_size: usersWhitelistQuery.variables.page_size,
          },
          staleTime: 5 * 60 * 1000,
        });
      }
    }
  }, [usersWhitelistQuery.data, usersWhitelistQuery.isPreviousData, usersWhitelistQuery.variables]);

  return (
    <section className="flex flex-col h-full lg:container mx-auto pb-2 md:pb-6 px-2 md:px-4 lg:px-0">
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
          <NewUserForm 
            onSubmit={values => addToWhitelistMutation.mutate(values)} 
            loading={addToWhitelistMutation.isLoading} 
          />
        </div>
      </Modal>
    </section>
  );
};

export default UsersPage;
  
const cols: ColumnDef<WhitelistItem>[] = [
  {
    id: "avatar",
    accessorKey: "user",
    header: "",
    columnTitle: "Avatar",
    size: 48,
    cell: ({ getValue }) => getValue<User | null>() ? (
      <UserAvatar
        user={getValue<User | null>()}
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
    accessorKey: "email",
    header: "Email",
    columnTitle: "Email",
    minSize: 250,
    flex: 1,
  },
  {
    accessorKey: "group",
    header: "Rol",
    columnTitle: "Rol",
    minSize: 150,
    cell: ({ row, getValue }) => <RoleSelector whitelistItem={row.original} value={getValue<Role>()} />,
    cellClassNames: {
      root: "!p-0"
    },
  },
  {
    id: "actions",
    header: "",
    columnTitle: "Acciones",
    size: 80,
    cellClassNames: {
      content: "flex w-full justify-center items-center"
    },
    cell: ({ row }) => (
      <>
        <DeleteUserAction whitelistItem={row.original} />
      </>
    ),
    enableResizing: false,
  },
];

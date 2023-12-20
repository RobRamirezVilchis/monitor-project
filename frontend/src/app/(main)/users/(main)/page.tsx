"use client";

import { useState } from "react";
import { Button, Modal } from "@mantine/core";

import { DeleteUserAction, SendPasswordChangeAction, UpdateUserAction } from "./Actions";
import { UserForm } from "./UserForm";
import { User } from "@/api/services/auth/types"; 
import { showSuccessNotification, showErrorNotification } from "@/ui/notifications";
import { useUsersQuery } from "@/api/queries/users";
import { getUserRoleLocalized } from "@/api/services/users";
import { ColumnDef } from "@/ui/data-grid/types";
import { useDataGrid } from "@/hooks/useDataGrid";
import { useCreateUserMutation } from "@/api/mutations/users";
import DataGrid from "@/ui/data-grid/DataGrid";

import { IconPlus } from "@tabler/icons-react";
import { withAuth } from "@/components/auth/withAuth";

import { useSsrDataGrid, usePrefetchPaginatedAdjacentQuery } from "@/hooks/useSsrDataGrid";

const UsersPage = () => {
  const {
    dataGridState, queryVariables, dataGridConfig
  } = useSsrDataGrid({
    enableColumnFilters: false,
    defaultSorting: ["first_name"],
  });
  const usersQuery = useUsersQuery({
    variables: queryVariables,
    refetchOnWindowFocus: false,
  });
  usePrefetchPaginatedAdjacentQuery({
    query: usersQuery,
    prefetchOptions: {
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
      ...dataGridState,
    },
    enableColumnResizing: true,
    hideColumnFooters: true,
    enableColumnActions: true,

    ...dataGridConfig as any,
    pageCount: usersQuery.data?.pagination?.pages ?? 0,
    rowCount: usersQuery.data?.pagination?.count ?? 0,
  });

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
    filterVariant: "multi-select",
    filterProps: {
      options: [
        { value: "Admin", label: "Administrador" },
        { value: "User",  label: "Usuario" },
      ]
    },
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

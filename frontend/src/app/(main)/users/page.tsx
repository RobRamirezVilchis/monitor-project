"use client";

import { GridCallbackDetails, GridColDef, GridFilterModel } from "@mui/x-data-grid";
import { useDebounce, useQueryState } from "@/hooks/shared";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";

import { useWhitelistQuery } from "@/api/queries/users";
import { WhitelistItem } from "@/api/users.types";
import { DataGrid, GridToolbarWithSearch } from "@/components/shared/DataGrid";
import { RoleSelector } from "@/components/users/RoleSelector";
import { Actions } from "@/components/users/Actions";
import { useState } from "react";
import { NewUserForm } from "@/components/users/NewUserForm";
import { useAddToWhitelistMutation } from "@/api/mutations/users";
import { useSnackbar } from "@/hooks/shared";

import AddIcon from '@mui/icons-material/Add';
import { getUserRoleLocalized } from "@/api/users";

const UsersPage = () => {
  const pagination = useQueryState({
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
  const usersWhitelistQuery = useWhitelistQuery({
    variables: {
      pagination: {
        page: pagination.state.page + 1,
        page_size: pagination.state.page_size,
      },
      filters: {
        ...filters,
        // sort: "-user",
      },
    },
  });
  const { enqueueSnackbar } = useSnackbar();
  const addToWhitelistMutation = useAddToWhitelistMutation({
    onSuccess: () => {
      enqueueSnackbar("Usuario agregado correctamente.", { variant: "success" });
      setNewUserFormOpen(false);
    },
    onError: () => enqueueSnackbar("Error al agregar el usuario.", { variant: "error" }),
  });
  const [newUserFormOpen, setNewUserFormOpen] = useState(false);

  const onFilterModelChange = (model: GridFilterModel, details: GridCallbackDetails<"filter">) => {
    debounceFilters({
      search: model.quickFilterValues?.[0] || undefined,
    });
  };

  return (
    <section className="flex flex-col h-full lg:container mx-auto pb-2 md:pb-6 px-2 md:px-4 lg:px-0">
      <div className="flex items-center">
        <h1 className="text-3xl font-bold py-2 flex-1">
          Usuarios
        </h1>

        <div className="text-neutral-800">
          <Button
            variant="text"
            color="inherit"
            startIcon={<AddIcon />}
            size="small"
            onClick={() => setNewUserFormOpen(true)}
          >
            Agregar usuario
          </Button>
        </div>
      </div>

      <div className="flex-[1_0_0] overflow-y-hidden pb-1 pr-1">
        <DataGrid
          rows={usersWhitelistQuery.data?.data || []}
          columns={cols}
          loading={usersWhitelistQuery.isLoading || usersWhitelistQuery.isFetching}
          disableColumnMenu
          rowSelection={false}
          className="h-full"
          
          pagination
          paginationMode="server"
          paginationModel={{
            page: pagination.state.page,
            pageSize: pagination.state.page_size,
          }}
          onPaginationModelChange={(model) => pagination.update({
            page: model.page,
            page_size: model.pageSize,
          })}
          pageSizeOptions={[25, 50, 100]}
          rowCount={usersWhitelistQuery.data?.pagination?.count || 0}

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

      <Dialog
        open={newUserFormOpen}
        onClose={() => setNewUserFormOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <div className="p-4">
          <NewUserForm 
            onSubmit={values => addToWhitelistMutation.mutate(values)} 
            loading={addToWhitelistMutation.isLoading} 
          />
        </div>
      </Dialog>
    </section>
  );
};

export default UsersPage;
  
const cols: GridColDef<WhitelistItem>[] = [
  {
    field: "avatar",
    headerName: "Avatar",
    renderHeader: () => null,
    width: 32,
    renderCell: params => params.row.user ? (
      <Avatar
        className="!w-8 !h-8"
        src={params.row.user?.extra?.picture}
        alt={params.value}
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
    field: "email",
    headerName: "Email",
    minWidth: 200,
    flex: 1,
    sortable: true,
  },
  {
    field: "group",
    headerName: "Rol",
    minWidth: 200,
    maxWidth: 350,
    flex: 1,
    sortable: true,
    valueFormatter: params => getUserRoleLocalized(params.value),
    renderCell: params => <RoleSelector whitelistItem={params.row} value={params.value} />,
  },
  {
    field: "actions",
    headerName: "Acciones",
    renderHeader: () => null,
    width: 80,
    renderCell: params => <Actions whitelistItem={params.row} />,
    type: "actions",
  }
];

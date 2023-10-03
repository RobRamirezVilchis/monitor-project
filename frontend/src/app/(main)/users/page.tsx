"use client";

import { GridCallbackDetails, GridColDef, GridFilterModel } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";

import { ConfirmDialogProvider } from "@/components/shared/ConfirmDialogProvider";
import { DataGrid, GridToolbarWithSearch } from "@/components/shared/DataGrid";
import { DeleteUserAction } from "@/components/users/Actions";
import { getUserRoleLocalized } from "@/api/users";
import { NewUserForm } from "@/components/users/NewUserForm";
import { RoleSelector } from "@/components/users/RoleSelector";
import { showSuccessNotification, showErrorNotification } from "@/components/ui/notifications";
import { useAddToWhitelistMutation } from "@/api/mutations/users";
import { useDebounce, useQueryState } from "@/hooks/shared";
import { User } from "@/api/auth.types"; 
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useWhitelistQuery } from "@/api/queries/users";
import { WhitelistItem } from "@/api/users.types";

import AddIcon from '@mui/icons-material/Add';

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

  //* Prefetch adjacent pages
  useEffect(() => {
    if (usersWhitelistQuery.data && usersWhitelistQuery.data.pagination && !usersWhitelistQuery.isPreviousData) {
      const paginationInfo = usersWhitelistQuery.data.pagination;
      if (paginationInfo.page > 1) {
        useWhitelistQuery.prefetch({
          variables: {
            filters: usersWhitelistQuery.variables.filters,
            pagination: {
              page: paginationInfo.page - 1,
              page_size: usersWhitelistQuery.variables.pagination?.page_size,
            }
          },
          staleTime: 5 * 60 * 1000,
        });
      }
      if (paginationInfo.page < paginationInfo.pages) {
        useWhitelistQuery.prefetch({
          variables: {
            filters: usersWhitelistQuery.variables.filters,
            pagination: {
              page: paginationInfo.page + 1,
              page_size: usersWhitelistQuery.variables.pagination?.page_size,
            }
          },
          staleTime: 5 * 60 * 1000,
        });
      }
    }
  }, [usersWhitelistQuery.data, usersWhitelistQuery.isPreviousData, usersWhitelistQuery.variables.filters, usersWhitelistQuery.variables.pagination?.page_size]);
  
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
        <ConfirmDialogProvider 
          outsideClickClose
          confirmButtonProps={{
            color: "error",
          }}
          cancelButtonProps={{
            color: "primary",
          }}
          dialogProps={{
            maxWidth: "xs",
            fullWidth: true,
          }}
        >
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
        </ConfirmDialogProvider>
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
      <UserAvatar
        user={params.row.user as User}
        className="!w-8 !h-8 !text-base"
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
    type: "actions",
    getActions: params => [
      <DeleteUserAction key={1} whitelistItem={params.row} />,
    ],
  }
];

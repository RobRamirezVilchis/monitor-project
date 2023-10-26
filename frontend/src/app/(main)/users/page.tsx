"use client";

import { useEffect, useState } from "react";
import { Button, Modal } from "@mantine/core";
import { PaginationState } from "@tanstack/react-table";
import { useImmer } from "use-immer";

import { DeleteUserAction } from "./Actions";
import { NewUserForm } from "./NewUserForm";
import { Role, User } from "@/api/auth.types"; 
import { RoleSelector } from "./RoleSelector";
import { showSuccessNotification, showErrorNotification } from "@/components/ui/notifications";
import { useAddToWhitelistMutation } from "@/api/mutations/users";
import { useQueryState } from "@/hooks/shared";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useWhitelistQuery } from "@/api/queries/users";
import { WhitelistItem } from "@/api/users.types";
import { ColumnDef } from "@/components/ui/data-grid/types";
import { es } from "@/components/ui/data-grid/locales/es";
import DataGrid from "@/components/ui/data-grid/DataGrid";
import useDataGrid from "@/components/ui/data-grid/useDataGrid";

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
  }>({});
  // const debounceFilters = useDebounce({
  //   callback: (newFilters: typeof filters) => {
  //     setFilters(newFilters);
  //   },
  //   debounceTime: 1000,
  // });
  const usersWhitelistQuery = useWhitelistQuery({
    variables: {
      pagination: {
        page: pagination.state.page,
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
  const grid = useDataGrid<WhitelistItem>({
    data: usersWhitelistQuery.data?.data || [],
    columns: cols,
    localization: es,
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

      <div className="flex-[1_0_0] min-h-[500px] overflow-y-hidden pb-1 pr-1">
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
    header: () => null,
    size: 48,
    cell: ({ cell, row, getValue }) => getValue<User | null>() ? (
      <UserAvatar
        user={getValue<User | null>()}
        size="sm"
      />
    ) : null,
  },
  {
    id: "user.name",
    accessorKey: "user",
    header: "Nombre",
    size: 250,
    cell: ({ getValue }) => getValue<User | null>() 
      ? `${getValue<User>().first_name ?? ""} ${getValue<User>().last_name ?? ""}`
      : "No registrado",
  },
  {
    accessorKey: "email",
    header: "Email",
    size: 250,
  },
  {
    accessorKey: "group",
    header: "Rol",
    size: 180,
    cell: ({ row, getValue }) => <RoleSelector whitelistItem={row.original} value={getValue<Role>()} />,
    cellClassNames: {
      root: "!p-0"
    }
  },
  {
    id: "actions",
    header: "Acciones",
    size: 100,
    cellClassNames: {
      content: "flex w-full justify-center items-center"
    },
    cell: ({ row }) => (
      <>
        <DeleteUserAction whitelistItem={row.original} />
      </>
    ),
  },
];

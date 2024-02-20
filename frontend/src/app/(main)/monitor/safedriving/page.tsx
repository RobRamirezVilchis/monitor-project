"use client";

import { useState } from "react";
import { Button, Modal } from "@mantine/core";


import { User } from "@/api/services/auth/types"; 
import { showSuccessNotification, showErrorNotification } from "@/ui/notifications";
import { useUsersQuery } from "@/api/queries/users";
import { getUserRoleLocalized } from "@/api/services/users";
import { ColumnDef } from "@/ui/data-grid/types";
import { useDataGrid, useSsrDataGrid, usePrefetchPaginatedAdjacentQuery } from "@/hooks/data-grid";
import { UserCreateData } from "@/api/services/users/types";
import { useCreateUserMutation } from "@/api/mutations/users";
import DataGrid from "@/ui/data-grid/DataGrid";

import { IconPlus } from "@tabler/icons-react";
import { withAuth } from "@/components/auth/withAuth";

const UsersPage = () => {
  const {
    dataGridState, queryVariables, dataGridConfig
  } = useSsrDataGrid<{ full_name: string; email: string; company: string; roles: string[]; }>({
    defaultSorting: ["full_name"],
    queryStateOptions: {
      navigateOptions: {
        scroll: false,
      },
      history: "replace",
    },
    transform: {
      roles: (key, value) => ({
        [key]: value?.sort().join(",") ?? "",
      })
    },
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

  

  return (
    <section className="flex flex-col h-full lg:container mx-auto pb-2 md:pb-6">
      <div className="flex items-center">
        <h1 className="text-3xl font-bold py-2 flex-1 my-5">
          Safe Driving
        </h1>
        
      </div>
      <div className="flex flex-row w-full gap-4 flex-wrap">
          <div className="h-40 w-1/5 ring-1 rounded-md ring-gray-300 p-3 bg-blue-200">
            <h3 className="text-xl font-bold">Unidad 9523</h3>
            <p>Read only</p>
          </div>

          <div className="h-40 w-1/5 ring-1 rounded-md ring-gray-300 p-3 bg-green-200">
            <h3 className="text-xl font-bold">Unidad 8413</h3>
            <p>Read only</p>
          </div>

          <div className="h-40 w-1/5 ring-1 rounded-md ring-gray-300 p-3 bg-green-200">
            <h3 className="text-xl font-bold">Unidad 8413</h3>
            <p>Read only</p>
          </div>

          

      </div>

      
    </section>
  );
};

export default withAuth(UsersPage, {
  rolesWhitelist: ["Admin"],
});
  

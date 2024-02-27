"use client";

import { useState } from "react";
import { Button, Modal } from "@mantine/core";

import { User } from "@/api/services/auth/types";
import {
  showSuccessNotification,
  showErrorNotification,
} from "@/ui/notifications";
import { useUsersQuery } from "@/api/queries/users";
import { useUnitsQuery } from "@/api/queries/monitor";
import { getUserRoleLocalized } from "@/api/services/users";
import { ColumnDef } from "@/ui/data-grid/types";
import {
  useDataGrid,
  useSsrDataGrid,
  usePrefetchPaginatedAdjacentQuery,
} from "@/hooks/data-grid";
import { UserCreateData } from "@/api/services/users/types";
import { useCreateUserMutation } from "@/api/mutations/users";
import DataGrid from "@/ui/data-grid/DataGrid";

import UnitCard from "../components/UnitCard";

import { IconPlus } from "@tabler/icons-react";
import { withAuth } from "@/components/auth/withAuth";
import { Unit } from "@/api/services/monitor/types";

const SafeDrivingPage = () => {
  const unitsQuery = useUnitsQuery({
    refetchOnWindowFocus: false,
  });

  const unitData = unitsQuery.data;

  const [newUserFormOpen, setNewUserFormOpen] = useState(false);

  return (
    <section className="flex flex-col h-full lg:container mx-auto pb-2 md:pb-6">
      <div className="flex items-center">
        <h1 className="ml-10 text-5xl font-bold py-2 flex-1 my-6">
          Safe Driving
        </h1>
      </div>

      <div className="flex flex-row w-full gap-4 flex-wrap place-content-evenly">
        {unitData?.map((unit) => (
          <UnitCard unit={unit} />
        ))}
      </div>
    </section>
  );
};

export default withAuth(SafeDrivingPage, {
  rolesWhitelist: ["Admin"],
});

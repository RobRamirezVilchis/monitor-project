"use client";

import { useState } from "react";
import { Button, Modal } from "@mantine/core";


import { User } from "@/api/services/auth/types"; 
import { showSuccessNotification, showErrorNotification } from "@/ui/notifications";
import { useUsersQuery } from "@/api/queries/users";
import { useUnitsQuery } from "@/api/queries/driving"; 
import { getUserRoleLocalized } from "@/api/services/users";
import { ColumnDef } from "@/ui/data-grid/types";
import { useDataGrid, useSsrDataGrid, usePrefetchPaginatedAdjacentQuery } from "@/hooks/data-grid";
import { UserCreateData } from "@/api/services/users/types";
import { useCreateUserMutation } from "@/api/mutations/users";
import DataGrid from "@/ui/data-grid/DataGrid";

import GxCard from "../components/GxCard";

import { IconPlus } from "@tabler/icons-react";
import { withAuth } from "@/components/auth/withAuth";

const IndustryPage = () => {

  const unitsQuery = useUnitsQuery({
    refetchOnWindowFocus: false,
  })
  console.log(unitsQuery)
  const unitData = unitsQuery.data;
  
 
  const [newUserFormOpen, setNewUserFormOpen] = useState(false);

  

  return (
    <section className="flex flex-col h-full lg:container mx-auto pb-2 md:pb-6">
      <div className="flex items-center">
        <h1 className="ml-10 text-5xl font-bold py-2 flex-1 my-6">
          Industry
        </h1>
      </div>


      <div className="flex flex-row w-full gap-4 flex-wrap place-content-evenly">
        {unitData?.map(unit => (
          <GxCard name={unit.unit} status={unit.status} description={unit.description} 
          onTrip={unit.on_trip} lastConnection={unit.last_connection}/>
        ))}
      </div>

      
    </section>
  );
};

export default withAuth(IndustryPage, {
  rolesWhitelist: ["Admin"],
});
  

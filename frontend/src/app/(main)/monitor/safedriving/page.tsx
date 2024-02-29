"use client";

import { useState } from "react";

import { useUnitsQuery } from "@/api/queries/monitor";

import UnitCard from "../(components)/UnitCard";

import { withAuth } from "@/components/auth/withAuth";


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

      <div className="flex flex-row w-full gap-4 flex-wrap ">
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

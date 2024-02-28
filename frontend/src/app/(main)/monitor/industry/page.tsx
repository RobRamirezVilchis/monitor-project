"use client";

import { useState } from "react";
import { useDevicesQuery } from "@/api/queries/monitor"; 
import DeviceCard from "../components/DeviceCard";

import { withAuth } from "@/components/auth/withAuth";

const IndustryPage = () => {

  const devicesQuery = useDevicesQuery({
    refetchOnWindowFocus: false,
  })
 
  const deviceData = devicesQuery.data;

  
 
  const [newUserFormOpen, setNewUserFormOpen] = useState(false);

  return (
    <section className="flex flex-col h-full lg:container mx-auto pb-2 md:pb-6">
      <div className="flex items-center">
        <h1 className="ml-10 text-5xl font-bold py-2 flex-1 my-6">
          Industry
        </h1>
      </div>

      <div className="flex flex-row w-full gap-4 flex-wrap place-content-evenly">
        {deviceData?.map((device) => (
          <DeviceCard device={device} />
        ))}
      </div>

      
    </section>
  );
};

export default withAuth(IndustryPage, {
  rolesWhitelist: ["Admin"],
});
  

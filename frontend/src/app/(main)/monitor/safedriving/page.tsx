"use client";

import { useState } from "react";

import { useUnitsQuery, useSeverityCount } from "@/api/queries/monitor";

import UnitCard from "../(components)/UnitCard";

import { withAuth } from "@/components/auth/withAuth";

type StatusKey = 0 | 1 | 2 | 3 | 4 | 5;
const statusStyles: { [key in StatusKey]: string } = {
  0: "bg-gray-100 border-gray-400",
  1: "bg-blue-100 border-blue-400",
  2: "bg-green-100 border-green-400",
  3: "bg-yellow-100 border-yellow-400",
  4: "bg-orange-100 border-orange-400",
  5: "bg-red-100 border-red-400",
};
const statusNames: { [key in StatusKey]: string } = {
  0: "Inactivo",
  1: "Funcionando",
  2: "Sin problemas",
  3: "Alerta",
  4: "Fallando",
  5: "Crítico",
};

const SafeDrivingPage = () => {
  const unitsQuery = useUnitsQuery({
    refetchOnWindowFocus: false,
  });
  const countQuery = useSeverityCount({
    refetchOnWindowFocus: false,
  });

  const unitData = unitsQuery.data;

  const [newUserFormOpen, setNewUserFormOpen] = useState(false);

  return (
    <section className="flex flex-col h-full mx-2 md:mx-32 pb-2 md:pb-6">
      <div className="flex items-center">
        <h1 className="text-5xl font-bold py-2 flex-1 my-6">Safe Driving</h1>
      </div>

      {countQuery.data && (
        <div className="flex w-fit px-4 py-2 mb-4 gap-6">
          {countQuery.data.map((severity_count) => (
            <div className="flex gap-2 items-center">
              <p>{severity_count.count}</p>
              <p>-</p>
              <div
                className={`inline-flex px-2.5 pt-1 pb-0.5 text-s font-semibold 
                border-2 ${
                  statusStyles[severity_count.severity as StatusKey]
                } rounded-full`}
              >
                {statusNames[severity_count.severity as StatusKey]}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-row gap-4 flex-wrap ">
        {unitData?.map((unit) => (
          <UnitCard key={unit.unit} unit={unit} />
        ))}
      </div>
    </section>
  );
};

export default withAuth(SafeDrivingPage, {
  rolesWhitelist: ["Admin"],
});

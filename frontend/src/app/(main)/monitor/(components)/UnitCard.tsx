"use client";

import { ReactNode, useState } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Unit, UnitStatus } from "@/api/services/monitor/types";
import { useRouter } from "next/navigation";

export interface GxCardProps {
  unit: UnitStatus;
}
type StatusKey = 0 | 1 | 2 | 3 | 4 | 5;
const statusColors: { [key in StatusKey]: string } = {
  0: "gray",
  1: "blue",
  2: "green",
  3: "yellow",
  4: "orange",
  5: "red",
};

const statusNames: { [key in StatusKey]: string } = {
  0: "Inactivo",
  1: "Funcionando",
  2: "Sin problemas",
  3: "Alerta",
  4: "Fallando",
  5: "Crítico",
};

const UnitCard = ({ unit: unit_obj }: GxCardProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const router = useRouter();

  const {
    unit,
    description,
    on_trip,
    last_connection,
    status,
    pending_events,
    pending_status,
  } = unit_obj;
  const { setDefaultOptions } = require("date-fns");

  let severity = Number(status.charAt(0));
  const color = statusColors[severity as StatusKey];

  let timeAgo: string;
  if (last_connection != null) {
    timeAgo = formatDistanceToNow(last_connection, {
      addSuffix: true,
      locale: es,
    });
  } else {
    timeAgo = "-";
  }

  return (
    <div
      className="group relative pb-6 w-[18rem] rounded-lg p-6 border-2 border-${color}-400
      transition duration-300 shadow-md hover:shadow-lg"
      onClick={() => router.push(`/monitor/safedriving/${unit}`)}
    >
      <div className="flex gap-2 items-center mb-3">
        <div
          className={`inline-flex px-2.5 pt-1 pb-0.5 text-s font-semibold 
        bg-${color}-100 border-2 border-${color}-400 rounded-full`}
        >
          {statusNames[severity as StatusKey]}
        </div>

        {on_trip && (
          <div className="inline-flex px-2.5 pt-1 pb-0.5 text-s font-semibold text-center border-2 border-yellow-500 rounded-full">
            En viaje
          </div>
        )}
      </div>

      <div className="flex gap-3 mb-2 items-center">
        <h3 className="ml-1 text-2xl font-bold">Unidad {unit}</h3>
      </div>

      <div className="flex items-center my-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
        <p className="text-sm ml-1">{timeAgo}</p>
      </div>

      <p className="text-lg px-2 py-1 bg-gray-200 border border-gray-200 rounded-md">
        {description}
      </p>
      <div
        className="absolute bottom-full mb-2 px-4 py-2 bg-gray-600 text-white rounded shadow-lg 
      opacity-0 transition-opacity delay-200 duration-300 ease-in-out group-hover:opacity-100"
      >
        <p>{pending_events} eventos pendientes</p>
        <p>{pending_status} status pendientes</p>
      </div>
    </div>
  );
};

export default UnitCard;
import React from "react";

const HoverableComponent = () => {
  return (
    <div className="relative flex justify-center items-center">
      <div className="group p-4 bg-blue-500 text-white rounded cursor-pointer">
        Hover over me!
        <div
          className="absolute z-10 bottom-full mb-2 px-4 py-2 bg-black 
          text-white rounded shadow-lg opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100"
          style={{ left: "50%", transform: "translateX(-50%)" }} // Center the dialog
        >
          This is the dialog
        </div>
      </div>
    </div>
  );
};

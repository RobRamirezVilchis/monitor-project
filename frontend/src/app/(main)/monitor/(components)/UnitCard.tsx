import { useState } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Unit, UnitStatus } from "@/api/services/monitor/types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { statusStyles, statusNames, StatusKey } from "./colors";

export interface GxCardProps {
  unit: UnitStatus;
}

const UnitCard = ({ unit: unit_status }: GxCardProps) => {
  const {
    unit_id,
    unit,
    client,
    description,
    priority,
    on_trip,
    last_connection,
    severity,
    pending_events,
    pending_status,
  } = unit_status;
  const { setDefaultOptions } = require("date-fns");

  const color = statusStyles[severity as StatusKey];

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
    <Link
      scroll={false}
      className={`group relative pb-6 w-72 md:max-lg:w-52 h-60 md:max-lg:h-72 rounded-lg p-6 border-2 
      transition duration-300 shadow-md dark:border-gray-700 hover:shadow-lg ${
        priority ? "border-red-300 dark:border-red-300" : ""
      }`}
      href={`/monitor/safe-driving/unit/${unit_id}`}
    >
      {/* <span className="absolute right-6 animate-ping inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-100"></span> */}
      {on_trip && (
        <span className="absolute right-6 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-400"></span>
        </span>
      )}

      <div
        className={`inline-flex mb-3 px-2.5 pt-1 pb-0.5 text-s font-semibold 
         border-2 ${color} rounded-full`}
      >
        {statusNames[severity as StatusKey]}
      </div>

      <h3 className="ml-1 text-2xl font-bold">
        {client == "Transpais" ? "Unidad" : ""} {unit}
      </h3>

      <div className="flex items-center my-2.5">
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

      <p className="text-lg leading-7 px-2 dark:bg-gray-700 py-1 bg-gray-200 border border-gray-200 dark:border-gray-700 rounded-md">
        {description}
      </p>
      <div className="flex justify-center">
        <div
          className="absolute invisible opacity-0 bottom-full mb-2 px-4 py-2 bg-gray-600 text-white rounded shadow-lg 
      transition-opacity duration-300 delay-200 ease-in-out group-hover:visible group-hover:opacity-100"
        >
          {pending_events == 1 ? (
            <p>{pending_events} evento pendiente</p>
          ) : (
            <p>{pending_events} eventos pendientes</p>
          )}

          {pending_status == 1 ? (
            <p>{pending_status} status pendiente</p>
          ) : (
            <p>{pending_status} status pendientes</p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default UnitCard;

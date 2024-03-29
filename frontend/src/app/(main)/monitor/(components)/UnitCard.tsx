import { useState } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Unit, UnitStatus } from "@/api/services/monitor/types";
import { useRouter } from "next/navigation";
import Link from "next/link";

export interface GxCardProps {
  unit: UnitStatus;
}
type StatusKey = 0 | 1 | 2 | 3 | 4 | 5;
const statusStyles: { [key in StatusKey]: string } = {
  0: "bg-gray-100 border-gray-400 text-gray-900",
  1: "bg-blue-100 border-blue-400 text-blue-900",
  2: "bg-green-100 border-green-400 text-green-900",
  3: "bg-yellow-100 border-yellow-400 text-yellow-900",
  4: "bg-orange-100 border-orange-400 text-orange-900",
  5: "bg-red-100 border-red-400 text-red-900",
};

const statusNames: { [key in StatusKey]: string } = {
  0: "Inactivo",
  1: "Funcionando",
  2: "Normal",
  3: "Alerta",
  4: "Fallando",
  5: "Crítico",
};

const UnitCard = ({ unit: unit_status }: GxCardProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const router = useRouter();

  const {
    unit_id,
    unit,
    description,
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
      className={`group relative pb-6 w-[18rem] md:w-52 lg:w-[18rem] rounded-lg p-6 border-2 
      transition duration-300 shadow-md dark:border-gray-700 hover:shadow-lg ${
        description == "Read only SSD" || description == "Tres cámaras fallando"
          ? "border-red-300 dark:border-red-300"
          : ""
      }`}
      href={`/monitor/safedriving/${unit_id}`}
    >
      {on_trip && (
        <span className="absolute right-6 animate-ping inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-100"></span>
      )}

      <div
        className={`inline-flex mb-3 px-2.5 pt-1 pb-0.5 text-s font-semibold 
         border-2 ${color} rounded-full`}
      >
        {statusNames[severity as StatusKey]}
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

      <p className="text-lg px-2 dark:bg-gray-700 py-1 bg-gray-200 border border-gray-200 dark:border-gray-700 rounded-md">
        {description}
      </p>

      <div
        className="absolute invisible opacity-0 bottom-full mb-2 px-4 py-2 bg-gray-600 text-white rounded shadow-lg 
      transition-opacity ease-in-out duration-300 delay-200 ease-in-out group-hover:visible group-hover:opacity-100"
      >
        <p>{pending_events} eventos pendientes</p>
        <p>{pending_status} status pendientes</p>
      </div>
    </Link>
  );
};

export default UnitCard;

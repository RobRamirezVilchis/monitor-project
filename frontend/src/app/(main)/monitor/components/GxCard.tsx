import { ReactNode } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Unit } from "@/api/services/monitor/types";

export interface GxCardProps {
  unit: Unit;
}
type StatusKey = 0 | 1 | 2 | 3 | 4 | 5;
const statusColors: { [key in StatusKey]: string } = {
  0: "bg-gray-300",
  1: "bg-blue-300",
  2: "bg-green-300",
  3: "bg-yellow-300",
  4: "bg-orange-300",
  5: "bg-red-300",
};

const GxCard = ({ unit }: GxCardProps) => {
  const { name, description, on_trip, last_connection, status } = unit;
  let severity = Number(status.charAt(0));
  const { setDefaultOptions } = require("date-fns");

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
      className={`pb-6 w-1/6 rounded-lg p-6 ${
        statusColors[severity as StatusKey]
      }`}
    >
      <div className="flex gap-3 mb-1">
        <h3 className="text-2xl font-bold">{name}</h3>
        {on_trip && (
          <div className="w-1/3 p-1 text-center bg-yellow-400 rounded-md">
            En viaje
          </div>
        )}
      </div>

      <p className="text-lg mb-1">{description}</p>
      <p className="text-lg mb-1">{timeAgo}</p>
    </div>
  );
};

export default GxCard;

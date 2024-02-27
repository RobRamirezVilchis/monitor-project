import { ReactNode, useState } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Unit } from "@/api/services/monitor/types";



export interface GxCardProps {
  unit: Unit;
}
type StatusKey = 0 | 1 | 2 | 3 | 4 | 5;
const statusColors: { [key in StatusKey]: string } = {
  0: 'gray',
  1: 'blue',
  2: 'green',
  3: 'yellow',
  4: 'orange',
  5: 'red',
};

const statusNames: { [key in StatusKey]: string } = {
  0: "Inactivo",
  1: "Funcionando",
  2: "Funcionando",
  3: "Alerta",
  4: "Fallando",
  5: "Crítico",
};

const UnitCard = ({ unit: unit_obj }: GxCardProps) => {
  const [isHovering, setIsHovering] = useState(false);

  const { unit, description, on_trip, last_connection, status, pending_events, pending_status } = unit_obj;
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
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`relative pb-6 w-64 rounded-lg p-6 border border-gray-300 shadow-md`}
    >
      <div className={`inline-flex mb-2 px-2.5 pt-1 pb-0.5 text-s font-semibold 
      bg-${color}-100 border-2 border-${color}-500 rounded-full`}>
        {statusNames[severity as StatusKey]}
      </div>
      

      <div className="flex gap-3 mb-2 items-center">
        <h3 className="ml-1 text-2xl font-bold">{unit}</h3>
        {on_trip && (
          <div className="w-fit pt-1 px-2 text-center border-2 border-yellow-500 rounded-full">
            En viaje
          </div>
        )}
      </div>

      {isHovering && (
        <div className="absolute bottom-full mb-2 px-4 py-2 bg-gray-600 text-white rounded shadow-lg transition-transform duration-300">
          <p>{pending_events} eventos pendientes</p>
          <p>{pending_status} status pendientes</p>
        </div>
      )}
      

      <div className="flex items-center my-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <p className="text-md ml-2 mt-1">{timeAgo}</p>
        
      </div>
      <p className="text-lg px-2 py-1 bg-gray-200 border border-gray-200 rounded-md">{description}</p>

      
    </div>
  );
};

export default UnitCard;

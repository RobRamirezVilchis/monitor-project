import { ReactNode } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Device } from "@/api/services/monitor/types";

export interface GxCardProps {
  device: Device;
}
type StatusKey = 1 | 3 | 5;
const statusColors: { [key in StatusKey]: string } = {
  1: 'blue',
  3: 'yellow',
  5: 'red',
};

const statusNames: { [key in StatusKey]: string } = {
  1: "Funcionando",
  3: "Alerta",
  5: "Crítico",
};

const UnitCard = ({ device: device_obj }: GxCardProps) => {
  const { device, last_connection, status, description } = device_obj;
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
      className={`pb-6 w-64 rounded-lg p-6 border border-gray-300 shadow-md`}
    >
      <div className={`inline-flex mb-2 px-2.5 pt-1 pb-0.5 text-s font-semibold 
      bg-${color}-100 border-2 border-${color}-500 rounded-full`}>
        {statusNames[severity as StatusKey]}
      </div>
      

      <div className="flex gap-3 mb-2 items-center">
        <h3 className="ml-1 text-2xl font-bold">{device}</h3>
      </div>

      <p className="text-lg mb-2 px-2 py-1 bg-gray-200 border border-gray-200 rounded-md">{description}</p>

      <div className="flex items-center mt-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <p className="text-md ml-2">{timeAgo}</p>
      </div>
      
    </div>
  );
};

export default UnitCard;

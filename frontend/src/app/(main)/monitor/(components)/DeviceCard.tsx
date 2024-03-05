import { ReactNode } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { DeviceStatus } from "@/api/services/monitor/types";
import { useRouter } from "next/navigation";

export interface GxCardProps {
  device: DeviceStatus;
}
type StatusKey = 1 | 3 | 5;
const statusStyles: { [key in StatusKey]: string } = {
  1: "bg-blue-100 border-blue-400",
  3: "bg-yellow-100 border-yellow-400",
  5: "bg-red-100 border-red-400",
};

const statusNames: { [key in StatusKey]: string } = {
  1: "Funcionando",
  3: "Alerta",
  5: "Crítico",
};

const DeviceCard = ({ device: device_obj }: GxCardProps) => {
  const {
    device_id,
    device: device_name,
    last_connection,
    severity,
    description,
  } = device_obj;

  const color = statusStyles[severity as StatusKey];
  const router = useRouter();

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
      onClick={() => router.push(`/monitor/industry/${device_id}`)}
    >
      <div
        className={`inline-flex mb-2 px-2.5 pt-1 pb-0.5 text-s font-semibold 
      ${color} border-2 rounded-full`}
      >
        {statusNames[severity as StatusKey]}
      </div>

      <div className="flex gap-3 mb-2 items-center">
        <h3 className="ml-1 text-2xl font-bold">{device_name}</h3>
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
        <p className="text-sm ml-2">{timeAgo}</p>
      </div>
      <p className="text-lg px-2 py-1 bg-gray-200 border border-gray-200 rounded-md">
        {description}
      </p>
    </div>
  );
};

export default DeviceCard;

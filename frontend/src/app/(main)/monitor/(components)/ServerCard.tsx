import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { ServerStatus } from "@/api/services/monitor/types";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ServerCard = (serverStatus: ServerStatus) => {
  const [isHovering, setIsHovering] = useState(false);
  const router = useRouter();

  const {
    server_id,
    server_name,
    aws_id,
    last_launch,
    last_activity,
    state,
    activity_data,
  } = serverStatus;

  const { setDefaultOptions } = require("date-fns");

  let timeAgo: string;
  timeAgo = formatDistanceToNow(last_activity, {
    addSuffix: true,
    locale: es,
  });
  return (
    <Link
      className="relative pb-6 w-72 md:max-lg:w-52 h-60 md:max-lg:h-72 rounded-lg p-6 border-2 
    transition duration-300 shadow-md dark:border-gray-700 hover:shadow-lg"
      href={`/monitor/servers/${server_id}`}
    >
      {state == "running" && (
        <span className="absolute right-6 animate-ping inline-flex h-2 w-2 rounded-full bg-green-600 opacity-100"></span>
      )}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col h-20 justify-center mb-2">
          <h3 className="text-2xl font-bold">
            {server_name.split("_").join(" ")}
          </h3>
          <p className="text-gray-500 ">{aws_id}</p>
        </div>
        <div className="flex items-center">
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
        <div className="text-lg">
          <div>
            <span>Uso de CPU: </span>
            {activity_data["Uso de CPU"] ? (
              <span>{activity_data["Uso de CPU"].toFixed(2) + "%"}</span>
            ) : (
              <span>{"0%"}</span>
            )}
          </div>
          <div>
            <span>Datos de salida: </span>
            {activity_data["Datos de salida"] ? (
              <span>
                {(activity_data["Datos de salida"] / 300 / 1024).toFixed(2) +
                  " MB/s"}
              </span>
            ) : (
              <span>{"0 MB/s"}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ServerCard;

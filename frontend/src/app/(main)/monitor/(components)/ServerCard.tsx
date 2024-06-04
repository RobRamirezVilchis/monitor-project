import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { ServerStatus } from "@/api/services/monitor/types";
import { useRouter } from "next/navigation";
import Link from "next/link";

const statusStyles: { [condition: string]: string } = {
  normal: "bg-blue-100 border-blue-400 text-blue-900",
  critical: "bg-red-100 border-red-400 text-red-900",
};

const ServerCard = ({
  serverStatus,
  projects,
}: {
  serverStatus: ServerStatus;
  projects: string[];
}) => {
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
    critical,
  } = serverStatus;

  const { setDefaultOptions } = require("date-fns");

  let timeAgo: string;
  timeAgo = formatDistanceToNow(last_activity, {
    addSuffix: true,
    locale: es,
  });
  let color;
  if (critical) {
    color = statusStyles.critical;
  } else {
    color = statusStyles.normal;
  }

  let splitter = new RegExp("_|-", "g");
  return (
    <Link
      className="group relative pb-6 w-72 md:max-lg:w-52 h-72 md:max-lg:h-72 rounded-lg p-6 border-2 
    transition duration-300 shadow-md dark:border-gray-700 hover:shadow-lg"
      href={`/monitor/services/servers/${server_id}`}
    >
      {state == "running" && (
        <span className="absolute right-6 animate-ping inline-flex h-2 w-2 rounded-full bg-green-600 opacity-100"></span>
      )}
      <div
        className={`inline-flex mb-2 px-2.5 pt-1 pb-0.5 text-s font-semibold 
        border-2 ${color} rounded-full`}
      >
        {critical ? "Crítico" : "Normal"}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col justify-center my-1 leading-none h-16">
          <h3 className="text-2xl font-bold">
            {server_name.split(splitter).join(" ")}
          </h3>
          <p className="text-gray-500">{aws_id}</p>
        </div>

        <div className="flex items-center opacity-60">
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
        <div className="text-md bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-3 rounded-md">
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
                {(activity_data["Datos de salida"] / 300 / 1e6).toFixed(2) +
                  " MB/s"}
              </span>
            ) : (
              <span>{"0 MB/s"}</span>
            )}
          </div>
        </div>
      </div>
      {projects.length != 0 && (
        <div
          className="z-50 absolute invisible opacity-0 bottom-full p-4 w-52 ml-4 mb-2 bg-gray-600 text-white rounded-lg shadow-lg 
      transition-opacity duration-300 delay-200 ease-in-out group-hover:visible group-hover:opacity-100"
        >
          <p className="font-bold mb-2 opacity-60">Proyectos</p>
          <div className="flex flex-wrap gap-2">
            {projects.map((name, index) => (
              <div
                key={index}
                className="border font-semibold border-gray-200 p-1 px-2 rounded-xl w-fit"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      )}
    </Link>
  );
};

export default ServerCard;

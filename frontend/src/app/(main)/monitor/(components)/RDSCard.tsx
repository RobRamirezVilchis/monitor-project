import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { RDSStatus, ServerStatus } from "@/api/services/monitor/types";
import { useRouter } from "next/navigation";
import Link from "next/link";

const capitalize = (text: string) => {
  return text
    .split(" ")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
};

const RDSCard = (rdsStatus: RDSStatus) => {
  const [isHovering, setIsHovering] = useState(false);
  const router = useRouter();

  const { rds_id, name, last_activity, status, activity_data } = rdsStatus;

  const { setDefaultOptions } = require("date-fns");

  let timeAgo: string;
  timeAgo = formatDistanceToNow(last_activity, {
    addSuffix: true,
    locale: es,
  });

  let splitter = new RegExp("_|-", "g");
  return (
    <Link
      className="relative pb-6 w-72 md:max-lg:w-52 h-60 md:max-lg:h-72 rounded-lg p-6 border-2 
    transition duration-300 shadow-md dark:border-gray-700 hover:shadow-lg"
      href={`/monitor/services/rds/${rds_id}`}
    >
      {status == "available" && (
        <span className="absolute right-6 animate-ping inline-flex h-2 w-2 rounded-full bg-green-600 opacity-100"></span>
      )}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col h-10 justify-center mt-2">
          <h3 className="text-2xl font-bold">
            {capitalize(name.split(splitter).join(" "))}
          </h3>
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
            <span>{activity_data["Uso de CPU"].toFixed(2) + "%"}</span>
          </div>
          <div>
            <span>RAM disponible: </span>
            <span>
              {(activity_data["RAM disponible"] / 1e9).toFixed(2) + " GB"}
            </span>
          </div>
          <div>
            {activity_data["Conexiones"] && (
              <div>
                <span>Conexiones: </span>
                <span>{activity_data["Conexiones"]}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RDSCard;

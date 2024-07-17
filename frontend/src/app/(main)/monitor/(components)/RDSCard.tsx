import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { RDSStatus, ServerStatus } from "@/api/services/monitor/types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Group, HoverCard } from "@mantine/core";

const statusStyles: { [condition: string]: string } = {
  normal: "bg-blue-100 border-blue-400 text-blue-900",
  critical: "bg-red-100 border-red-400 text-red-900",
};

const capitalize = (text: string) => {
  return text
    .split(" ")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
};

const RDSCard = ({
  rdsStatus,
  projects,
}: {
  rdsStatus: RDSStatus;
  projects: string[];
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const router = useRouter();

  const { rds_id, name, last_activity, status, activity_data, critical } =
    rdsStatus;

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
    <Group justify="center">
      <HoverCard>
        {projects.length != 0 && (
          <HoverCard.Dropdown
            w={220}
            className=" p-4 w-52 mb-2 bg-gray-600 
          text-white rounded-lg shadow-lg "
          >
            <p className="font-bold mb-2 opacity-70">Proyectos</p>
            <div className="flex flex-wrap gap-2">
              {projects.map((name, index) => (
                <div
                  key={index}
                  className="border-2 font-semibold border-gray-400 
                  p-1 px-2 rounded-xl w-fit"
                >
                  {name}
                </div>
              ))}
            </div>
          </HoverCard.Dropdown>
        )}
        <HoverCard.Target>
          <Link
            className="relative pb-6 w-72 md:max-lg:w-52 h-72 md:max-lg:h-72 rounded-lg p-6 border-2 
    transition duration-300 shadow-md dark:border-dark-400 hover:shadow-lg"
            href={`/monitor/services/rds/${rds_id}`}
          >
            <div
              className={`inline-flex mb-2 px-2.5 pt-1 pb-0.5 text-s font-semibold 
        border-2 ${color} rounded-full`}
            >
              {critical ? "Crítico" : "Normal"}
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex flex-col justify-center">
                <h3 className="text-2xl font-bold">
                  {capitalize(name.split(splitter).join(" "))}
                </h3>
              </div>
              <div className="flex items-center opacity-60 mb-1">
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
              <div className="text-md dark:bg-dark-500 bg-neutral-200 p-3 rounded-md">
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
                  <div>
                    <span>Conexiones: </span>
                    <span>{activity_data["Conexiones"]}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </HoverCard.Target>
      </HoverCard>
    </Group>
  );
};

export default RDSCard;

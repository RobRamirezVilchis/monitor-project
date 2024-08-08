import { ReactNode } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  DeviceStatus,
  RetailDeviceStatus,
  RombergDeviceStatus,
} from "@/api/services/monitor/types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { statusStyles, statusNames, StatusKey } from "./colors";

export interface GxCardProps {
  device: RombergDeviceStatus;
}

const RombergDeviceCard = ({ device: device_obj }: GxCardProps) => {
  const {
    device_id,
    device_description,
    client,
    last_activity,
    severity,
    description,
    records,
  } = device_obj;

  const color = statusStyles[severity as StatusKey];
  const router = useRouter();

  let timeAgo: string;
  if (last_activity != null) {
    timeAgo = formatDistanceToNow(last_activity, {
      addSuffix: true,
      locale: es,
    });
  } else {
    timeAgo = "-";
  }

  let critical: string[] = [];
  for (const metricName in records) {
    if (records[metricName].critical) {
      critical.push(metricName);
    }
  }

  return (
    <Link
      className="relative pb-6 w-72 h-60 rounded-lg p-6 border-2 
      transition duration-300 shadow-md dark:border-dark-400 hover:shadow-lg"
      href={`/monitor/safe-driving/romberg/device/${device_id}`}
    >
      <div className="flex mb-3 justify-between items-center">
        <div
          className={`inline-flex px-2.5 pt-1 pb-0.5 text-s font-semibold 
          border-2 ${color} rounded-full`}
        >
          {statusNames[severity as StatusKey]}
        </div>
        {/* {critical.map(() => (
          <h2 className="font-bold px-2 py-0.5 bg-red-100 dark:bg-red-950 rounded-md text-red-500">
            {critical}
          </h2>
        ))} */}
        {critical.length > 0 && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-red-700 opacity-70 dark:text-red-400 icon icon-tabler icons-tabler-outline icon-tabler-alert-triangle"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 9v4" />
            <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z" />
            <path d="M12 16h.01" />
          </svg>
        )}
      </div>

      <div className="flex gap-3 mb-2 items-end">
        <h3 className="ml-1 text-2xl font-bold">{device_description}</h3>
        {/* <h2 className="font-semibold text-neutral-400 dark:text-dark-200">
          {client}
        </h2> */}
      </div>

      <div className="flex items-center my-3">
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
      <p className="text-lg px-2 dark:bg-dark-500 py-1 bg-neutral-200 border border-gray-200 dark:border-gray-700 rounded-md">
        {description}
      </p>
    </Link>
  );
};

export default RombergDeviceCard;

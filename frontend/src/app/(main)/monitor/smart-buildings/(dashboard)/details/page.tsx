"use client";

import {
  useSBDevicesQuery,
  useSmartBuildingsSeverityCount,
} from "@/api/queries/monitor";
import { useCallback, useState } from "react";
import DeviceCard from "../../../(components)/DeviceCard";

import { PieChart } from "@mantine/charts";
import { TextInput } from "@mantine/core";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  StatusKey,
  pieColors,
  statusNames,
  statusStyles,
} from "../../../(components)/colors";

const SmartBuildingsDetailsPage = () => {
  const router = useRouter();
  const [value, setValue] = useState("");
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter");

  const currentDate = new Date();
  let yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const [dateValue, setDateValue] = useState<[Date | null, Date | null]>([
    yesterday,
    currentDate,
  ]);

  // Get a new searchParams string by merging the current
  // searchParams with a provided key/value pair
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  const devicesQuery = useSBDevicesQuery({
    refetchOnWindowFocus: false,
  });
  const deviceData = devicesQuery.data;

  const countQuery = useSmartBuildingsSeverityCount({
    refetchOnWindowFocus: false,
  });

  const data = [];
  if (countQuery.data) {
    for (const level of countQuery?.data) {
      if (level["severity"] != 0) {
        data.push({
          name: statusNames[level["severity"] as StatusKey],
          value: level["count"],
          color: pieColors[level["severity"] as StatusKey],
        });
      }
    }
  }

  const areaPlotData: {
    fecha: Date;
    Crítico: number;
    Alerta: number;
    Funcionando: number;
  }[] = [];

  return (
    <section>
      <div className="flex items-center">
        <div className="relative mr-10">
          <div className="pr-0 lg:pr-52">
            <TextInput
              className="flex gap-3 items-center w-100 mb-4"
              styles={{
                label: { fontSize: 18 },
              }}
              label="Buscar dispositivo:"
              value={value}
              onChange={(event) => setValue(event.currentTarget.value)}
            />

            {countQuery.data && (
              <div className="flex w-fit py-2 mb-4 gap-6 flex-wrap">
                {countQuery.data.map((severity_count) => (
                  <div
                    key={severity_count.severity}
                    className="flex gap-2 items-center"
                  >
                    <p>{severity_count.count}</p>
                    <p>-</p>
                    <Link
                      href={
                        filter == null
                          ? "/monitor/smart-buildings/details?" +
                            createQueryString(
                              "filter",
                              String(severity_count.severity)
                            )
                          : "/monitor/smart-buildings/details"
                      }
                      className={`${
                        severity_count.severity == Number(filter) ||
                        filter == null
                          ? "opacity-100"
                          : "opacity-50"
                      } inline-flex px-2.5 pt-1 pb-0.5 text-s font-semibold border-2 ${
                        statusStyles[severity_count.severity as StatusKey]
                      } rounded-full`}
                    >
                      {statusNames[severity_count.severity as StatusKey]}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="absolute -right-96 -mr-24 2xl:-mr-48 bottom-0 hidden lg:block">
            <PieChart
              data={data}
              size={150}
              withLabels
              withLabelsLine
              labelsType="percent"
              labelsPosition="outside"
              withTooltip
              tooltipDataSource="segment"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-row gap-4 flex-wrap">
        {deviceData?.map((deviceStatus, i) =>
          deviceStatus.device_name.includes(value) &&
          (filter == null || deviceStatus.severity == Number(filter)) ? (
            <DeviceCard
              key={i}
              deployment="smart-buildings"
              device_status={deviceStatus}
            />
          ) : null
        )}
      </div>
    </section>
  );
};

export default SmartBuildingsDetailsPage;

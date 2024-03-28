"use client";

import { useCallback, useState } from "react";
import {
  useDevicesQuery,
  useIndustrySeverityCount,
} from "@/api/queries/monitor";
import DeviceCard from "../(components)/DeviceCard";

import { TextInput } from "@mantine/core";
import { PieChart } from "@mantine/charts";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ColorSchemeSwitchToggle } from "@/components/shared";

type StatusKey = 0 | 1 | 2 | 3 | 4 | 5;
const statusStyles: { [key in StatusKey]: string } = {
  0: "bg-gray-100 border-gray-400 text-gray-900",
  1: "bg-blue-100 border-blue-400 text-blue-900",
  2: "bg-green-100 border-green-400 text-green-900",
  3: "bg-yellow-100 border-yellow-400 text-yellow-900",
  4: "bg-orange-100 border-orange-400 text-orange-900",
  5: "bg-red-100 border-red-400 text-red-900",
};
const statusNames: { [key in StatusKey]: string } = {
  0: "Inactivo",
  1: "Funcionando",
  2: "Normal",
  3: "Alerta",
  4: "Fallando",
  5: "Crítico",
};
const statusColors: { [key in StatusKey]: string } = {
  0: "gray",
  1: "blue",
  2: "green",
  3: "yellow",
  4: "orange",
  5: "red",
};

const IndustryPage = () => {
  const [value, setValue] = useState("");
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter");

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

  const devicesQuery = useDevicesQuery({
    refetchOnWindowFocus: false,
  });

  const countQuery = useIndustrySeverityCount({
    refetchOnWindowFocus: false,
  });

  const deviceData = devicesQuery.data;

  const data = [];
  if (countQuery.data) {
    for (const level of countQuery?.data) {
      if (level["severity"] != 0) {
        data.push({
          name: statusNames[level["severity"] as StatusKey],
          value: level["count"],
          color: statusColors[level["severity"] as StatusKey],
        });
      }
    }
  }
  return (
    <section>
      <div className="flex">
        <div className="mr-24">
          <h1 className="text-5xl font-bold pb-2 flex-1 mb-3 md:mb-6 pr-2">
            Industry
          </h1>

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
                        ? "/monitor/industry/?" +
                          createQueryString(
                            "filter",
                            String(severity_count.severity)
                          )
                        : "/monitor/industry/"
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

        <div className="hidden md:block">
          <PieChart
            data={data}
            mt={0}
            mb={0}
            py={0}
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

      <div className="flex flex-row gap-4 flex-wrap">
        {deviceData?.map((device) =>
          device.device.includes(value) &&
          (filter == null || device.severity == Number(filter)) ? (
            <DeviceCard key={device.device} device={device} />
          ) : null
        )}
      </div>
    </section>
  );
};

export default IndustryPage;

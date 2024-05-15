"use client";

import { useCallback, useEffect, useState } from "react";
import {
  useDevicesQuery,
  useIndustryAreaPlotData,
  useIndustryLastUpdateQuery,
  useIndustrySeverityCount,
  useRetailDeviceStatusQuery,
  useRetailSeverityCount,
  useRetailStatusQuery,
  useSafeDrivingAreaPlotData,
} from "@/api/queries/monitor";
import DeviceCard from "../../../(components)/DeviceCard";

import { Checkbox, SegmentedControl, Tabs, TextInput } from "@mantine/core";
import { AreaChart, AreaChartType, PieChart } from "@mantine/charts";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DatePickerInput } from "@mantine/dates";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import RetailDeviceCard from "../../../(components)/RetailDeviceCard";

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
  3: "yellow.5",
  4: "orange",
  5: "red",
};

const IndustryDetailsPage = () => {
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

  const devicesQuery = useRetailStatusQuery({
    refetchOnWindowFocus: false,
  });
  const deviceData = devicesQuery.data;

  const countQuery = useRetailSeverityCount({
    refetchOnWindowFocus: false,
  });

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
      <div className="flex items-center">
        <div className="relative mr-10">
          <div className="mr-0 lg:mr-60">
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
                          ? "/monitor/smart-retail/details?" +
                            createQueryString(
                              "filter",
                              String(severity_count.severity)
                            )
                          : "/monitor/smart-retail/details"
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

          <div className="absolute -right-96 -mr-40 bottom-0 hidden lg:block">
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
      </div>

      <div className="flex flex-row gap-4 flex-wrap">
        {deviceData?.map((device) =>
          device.name.toLowerCase().includes(value.toLowerCase()) &&
          (filter == null || device.severity == Number(filter)) ? (
            <RetailDeviceCard key={device.name} device={device} />
          ) : null
        )}
      </div>
    </section>
  );
};

export default IndustryDetailsPage;

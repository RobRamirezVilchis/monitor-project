"use client";

import {
  useRetailSeverityCount,
  useRetailStatusQuery,
} from "@/api/queries/monitor";
import { useCallback, useState } from "react";

import { PieChart } from "@mantine/charts";
import { TextInput } from "@mantine/core";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import RetailDeviceCard from "../../../(components)/RetailDeviceCard";
import {
  statusStyles,
  statusNames,
  StatusKey,
  pieColors,
} from "../../../(components)/colors";

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
          color: pieColors[level["severity"] as StatusKey],
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

          <div className="absolute -right-96 -mr-18 2xl:-mr-36 bottom-0 hidden lg:block">
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

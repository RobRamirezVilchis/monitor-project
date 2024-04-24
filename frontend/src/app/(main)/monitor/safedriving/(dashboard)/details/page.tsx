"use client";

import { useCallback, useEffect, useState } from "react";
import { TextInput, useCombobox, Select } from "@mantine/core";
import { PieChart } from "@mantine/charts";

import {
  useUnitsQuery,
  useDrivingSeverityCount,
  useSafeDrivingClientsQuery,
  useDrivingLastUpdateQuery,
} from "@/api/queries/monitor";

import UnitCard from "../../../(components)/UnitCard";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

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

const SafeDrivingPage = () => {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });
  const [clientValue, setClientValue] = useState<string | null>(null);

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

  const unitsStatusQuery = useUnitsQuery({
    refetchOnWindowFocus: false,
  });
  const unitsData = unitsStatusQuery.data;

  const countQuery = useDrivingSeverityCount({
    refetchOnWindowFocus: false,
  });
  const lastUpdateQuery = useDrivingLastUpdateQuery({
    refetchOnWindowFocus: false,
  });
  const last_update = lastUpdateQuery.data;

  const clientsQuery = useSafeDrivingClientsQuery({
    refetchOnWindowFocus: false,
  });
  const clients = clientsQuery.data?.map((data) => data.name);

  let timeAgo: string;
  if (last_update != null) {
    timeAgo = formatDistanceToNow(last_update.last_update, {
      addSuffix: true,
      locale: es,
    });
  } else {
    timeAgo = "-";
  }

  const severityCountDict: { [key in StatusKey]: number } = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
    0: 0,
  };

  const severityCount: {
    level: number;
    name: string;
    value: number;
    color: string;
  }[] = [];

  if (unitsData) {
    for (const unitData of unitsData) {
      if (clientValue) {
        if (clientValue == unitData.client) {
          severityCountDict[unitData.severity as StatusKey]++;
        }
      } else {
        severityCountDict[unitData.severity as StatusKey]++;
      }
    }
    for (let i = 5; i >= 0; i--) {
      severityCount.push({
        level: i,
        name: statusNames[i as StatusKey],
        value: severityCountDict[i as StatusKey],
        color: statusColors[i as StatusKey],
      });
    }
  }

  return (
    <section className="mb-20">
      <div className="flex items-center">
        <div className="relative mr-10">
          <div className="pr-0 lg:pr-28 mb-6">
            <div className="flex flex-col md:flex-row mb-4 gap-4 md:gap-10">
              <TextInput
                className="md:flex gap-3 items-center "
                styles={{
                  label: { fontSize: 18 },
                }}
                label="Buscar unidad:"
                value={value}
                onChange={(event) => setValue(event.currentTarget.value)}
              />

              <Select
                className="md:flex gap-3 items-center"
                styles={{
                  label: { fontSize: 18 },
                }}
                label="Filtrar por cliente:"
                placeholder="Todos"
                data={clients}
                onChange={(value: string | null) => setClientValue(value)}
              ></Select>
            </div>

            {countQuery.data && (
              <div className="flex w-fit py-2 mb-4 gap-6 flex-wrap">
                {severityCount.map((severity_count) => (
                  <div
                    key={severity_count.level}
                    className="flex gap-2 items-center"
                  >
                    <p>{severity_count.value}</p>
                    <p>-</p>

                    <Link
                      href={
                        filter == null || Number(filter) != severity_count.level
                          ? "/monitor/safedriving/details/?" +
                            createQueryString(
                              "filter",
                              String(severity_count.level)
                            )
                          : "/monitor/safedriving/details"
                      }
                      className={`${
                        severity_count.level == Number(filter) || filter == null
                          ? "opacity-100"
                          : "opacity-30"
                      } inline-flex px-2.5 pt-1 pb-0.5 text-s font-semibold border-2 ${
                        statusStyles[severity_count.level as StatusKey]
                      } rounded-full`}
                    >
                      {statusNames[severity_count.level as StatusKey]}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="absolute -right-40 bottom-0 hidden lg:block">
            <PieChart
              data={severityCount.slice(0, 5)}
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
        {unitsData?.map((unit) =>
          unit.unit.startsWith(value) &&
          (unit.client == clientValue || clientValue == null) &&
          (filter == null || unit.severity == Number(filter)) ? (
            <UnitCard key={unit.unit} unit={unit} />
          ) : null
        )}
      </div>
    </section>
  );
};

export default SafeDrivingPage;

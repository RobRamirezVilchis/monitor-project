"use client";

import { PieChart } from "@mantine/charts";
import { HoverCard, Select, TextInput, useCombobox } from "@mantine/core";
import { useCallback, useState } from "react";

import {
  useDrivingSeverityCount,
  useSafeDrivingClientsQuery,
  useUnitsQuery,
} from "@/api/queries/monitor";

import UnitCard from "../../../(components)/UnitCard";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  StatusKey,
  pieColors,
  statusNames,
  statusStyles,
} from "../../../(components)/colors";

const SafeDrivingPage = () => {
  const router = useRouter();
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });
  const [clientValue, setClientValue] = useState<string | null>(null);

  const [value, setValue] = useState("");
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status");
  const clientFilter = searchParams.get("client");

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
  const removeQueryParam = useCallback(
    (name: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(name);

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

  const clientsQuery = useSafeDrivingClientsQuery({
    refetchOnWindowFocus: false,
  });
  const clients = clientsQuery.data?.map((data) => data.name);

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
        color: pieColors[i as StatusKey],
      });
    }
  }

  let statusTooltipText: { [key: number]: [string, string][] } = {};
  if (countQuery.data) {
    for (const sevCount of countQuery.data) {
      let problemsList: [string, string][] = [];
      for (const reason of sevCount.breakdown) {
        problemsList.push([reason.description, reason.count]);
      }
      statusTooltipText[sevCount.severity] = problemsList;
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
                value={clientFilter}
                onChange={(value: string | null) => {
                  router.push(
                    value
                      ? "/monitor/safe-driving/details/?" +
                          createQueryString("client", value)
                      : "/monitor/safe-driving/details/?" +
                          removeQueryParam("client")
                  );
                  setClientValue(value);
                }}
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
                    <HoverCard openDelay={500}>
                      <HoverCard.Target>
                        <Link
                          href={
                            statusFilter == null ||
                            Number(statusFilter) != severity_count.level
                              ? "/monitor/safe-driving/details/?" +
                                createQueryString(
                                  "status",
                                  String(severity_count.level)
                                )
                              : "/monitor/safe-driving/details/?" +
                                removeQueryParam("status")
                          }
                          className={`${
                            severity_count.level == Number(statusFilter) ||
                            statusFilter == null
                              ? "opacity-100"
                              : "opacity-30"
                          } inline-flex px-2.5 pt-1 pb-0.5 text-s font-semibold border-2 ${
                            statusStyles[severity_count.level as StatusKey]
                          } rounded-full`}
                        >
                          {statusNames[severity_count.level as StatusKey]}
                        </Link>
                      </HoverCard.Target>
                      {clientFilter == null &&
                        statusTooltipText[severity_count.level] && (
                          <HoverCard.Dropdown>
                            <p className="font-bold">
                              Cantidad de dispositivos por categoría:
                            </p>
                            {statusTooltipText[severity_count.level].map(
                              (statusProblems, i) => (
                                <p key={`${severity_count.level}_${i}`}>
                                  <span>{statusProblems[0]}</span>
                                  <span> - </span>
                                  <span>{statusProblems[1]}</span>
                                </p>
                              )
                            )}
                          </HoverCard.Dropdown>
                        )}
                    </HoverCard>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="absolute -right-40 bottom-0 hidden lg:block">
            <PieChart
              data={severityCount.slice(0, 5)}
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
          (clientFilter == null || unit.client == clientFilter) &&
          (statusFilter == null || unit.severity == Number(statusFilter)) ? (
            <UnitCard key={unit.unit} unit={unit} />
          ) : null
        )}
      </div>
    </section>
  );
};

export default SafeDrivingPage;

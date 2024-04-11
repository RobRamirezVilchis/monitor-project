"use client";

import { useCallback, useState } from "react";
import { Tabs, rem } from "@mantine/core";
import { AreaChart } from "@mantine/charts";
import {
  IconPhoto,
  IconMessageCircle,
  IconSettings,
} from "@tabler/icons-react";

import {
  TextInput,
  MultiSelect,
  Input,
  InputBase,
  Combobox,
  useCombobox,
  Select,
  ComboboxItem,
} from "@mantine/core";
import { PieChart } from "@mantine/charts";

import {
  useUnitsQuery,
  useDrivingSeverityCount,
  useSafeDrivingClientsQuery,
  useSafeDrivingAreaPlotData,
} from "@/api/queries/monitor";

import UnitCard from "../(components)/UnitCard";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { ColorSchemeSwitchToggle } from "@/components/shared";
import { DatePickerInput } from "@mantine/dates";

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
  const router = useRouter();
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });
  const [clientValue, setClientValue] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>("details");
  const [value, setValue] = useState("");
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
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

  const unitsStatusQuery = useUnitsQuery({
    refetchOnWindowFocus: false,
  });
  const countQuery = useDrivingSeverityCount({
    refetchOnWindowFocus: false,
  });
  const clientsQuery = useSafeDrivingClientsQuery({
    refetchOnWindowFocus: false,
  });
  const areaPlotDataQuery = useSafeDrivingAreaPlotData({
    variables: {
      timestamp_after: dateValue[0],
      timestamp_before: dateValue[1],
    },
  });
  const areaPlotQueryData = areaPlotDataQuery?.data;

  const clients = clientsQuery.data?.map((data) => data.name);

  const unitsData = unitsStatusQuery.data;

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

  const areaPlotData: {
    fecha: Date;
    Crítico: number;
    Fallando: number;
    Alerta: number;
    Normal: number;
    Funcionando: number;
  }[] = [];

  if (areaPlotQueryData) {
    for (const hourCount of areaPlotQueryData) {
      console.log(hourCount.severity_counts["5"]);
      areaPlotData.push({
        fecha: hourCount.timestamp,
        Crítico: hourCount.severity_counts["5"],
        Fallando: hourCount.severity_counts["4"],
        Alerta: hourCount.severity_counts["3"],
        Normal: hourCount.severity_counts["2"],
        Funcionando: hourCount.severity_counts["1"],
      });
    }
  }

  return (
    <section className="relative mb-20">
      <Tabs
        value={tab}
        onChange={(value) => {
          setActiveTab(value);
          value
            ? router.push(
                "/monitor/safedriving/?" + createQueryString("tab", value)
              )
            : router.push("/monitor/safedriving/");
        }}
      >
        <div className="flex pb-2 mb-3 md:mb-6">
          <h1 className="text-5xl font-bold  pr-10">Safe Driving</h1>
          <Tabs.List>
            <Tabs.Tab value="details">Detalles</Tabs.Tab>
            <Tabs.Tab value="statistics">Estadísticas</Tabs.Tab>
          </Tabs.List>
        </div>
        <Tabs.Panel value="details">
          <div className="flex items-center">
            <div className="mr-10">
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
                          filter == null ||
                          Number(filter) != severity_count.level
                            ? "/monitor/safedriving/?" +
                              createQueryString(
                                "filter",
                                String(severity_count.level)
                              )
                            : "/monitor/safedriving/"
                        }
                        className={`${
                          severity_count.level == Number(filter) ||
                          filter == null
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
            <div className="hidden md:block">
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

          <div className="flex flex-row gap-4 flex-wrap">
            {unitsData?.map((unit) =>
              unit.unit.startsWith(value) &&
              (unit.client == clientValue || clientValue == null) &&
              (filter == null || unit.severity == Number(filter)) ? (
                <UnitCard key={unit.unit} unit={unit} />
              ) : null
            )}
          </div>
        </Tabs.Panel>
        <Tabs.Panel value="statistics">
          <div className="flex items-center mb-6">
            <h2 className="text-xl ">Gráfica de estátus en el tiempo:</h2>

            <div className="w-80 ml-4">
              <DatePickerInput
                type="range"
                placeholder="Pick date"
                value={dateValue}
                onChange={setDateValue}
              />
            </div>
          </div>

          {areaPlotData && (
            <div className="mt-8">
              <AreaChart
                h={500}
                data={areaPlotData}
                dataKey="fecha"
                tooltipAnimationDuration={200}
                type="percent"
                series={[
                  { name: "Funcionando", color: "blue" },
                  { name: "Normal", color: "green" },
                  { name: "Alerta", color: "yellow.5" },
                  { name: "Fallando", color: "orange" },
                  { name: "Crítico", color: "red" },
                ]}
              />
            </div>
          )}
        </Tabs.Panel>
      </Tabs>
    </section>
  );
};

export default SafeDrivingPage;

"use client";

import { useState } from "react";
import { Checkbox, Paper, Text, SegmentedControl, Select } from "@mantine/core";
import {
  AreaChart,
  AreaChartType,
  ChartTooltipProps,
  getFilteredChartTooltipPayload,
} from "@mantine/charts";

import {
  useSafeDrivingClientsQuery,
  useSafeDrivingAreaPlotData,
  useDrivingLastUpdateQuery,
} from "@/api/queries/monitor";

import { DatePickerInput } from "@mantine/dates";
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
  const [clientValue, setClientValue] = useState<string | null>(null);
  const [graphMode, setGraphMode] = useState<string>("stacked");
  const [showInactive, setShowInactive] = useState<boolean>(false);

  const currentDate = new Date();
  let yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const [dateValue, setDateValue] = useState<[Date | null, Date | null]>([
    yesterday,
    currentDate,
  ]);

  const lastUpdateQuery = useDrivingLastUpdateQuery({
    refetchOnWindowFocus: false,
  });
  const last_update = lastUpdateQuery.data;

  const clientsQuery = useSafeDrivingClientsQuery({
    refetchOnWindowFocus: false,
  });
  const clients = clientsQuery.data?.map((data) => data.name);

  const areaPlotDataQuery = useSafeDrivingAreaPlotData({
    variables: {
      timestamp_after: dateValue[0],
      timestamp_before: dateValue[1],
      client: clientValue,
    },
  });
  const areaPlotQueryData = areaPlotDataQuery?.data;

  let timeAgo: string;
  if (last_update != null) {
    timeAgo = formatDistanceToNow(last_update.last_update, {
      addSuffix: true,
      locale: es,
    });
  } else {
    timeAgo = "-";
  }

  const areaPlotData: {
    fecha: Date;
    Crítico: number;
    Fallando: number;
    Alerta: number;
    Normal: number;
    Funcionando: number;
    Inactivo: number;
  }[] = [];

  if (areaPlotQueryData) {
    for (const hourCount of areaPlotQueryData) {
      areaPlotData.push({
        fecha: hourCount.timestamp,
        Crítico: hourCount.severity_counts["5"],
        Fallando: hourCount.severity_counts["4"],
        Alerta: hourCount.severity_counts["3"],
        Normal: hourCount.severity_counts["2"],
        Funcionando: hourCount.severity_counts["1"],
        Inactivo: hourCount.severity_counts["0"],
      });
    }
  }

  return (
    <section className="mb-28">
      <h2 className="text-2xl mb-2 md:mb-4 opacity-50">
        Estátus general en el tiempo
      </h2>
      <div className="md:flex items-center mb-6 gap-4 md:gap-8 space-y-4 md:space-y-0 justify-start">
        <div className="md:flex gap-0 sm:gap-2 items-center">
          <p className="hidden md:block">Rango de tiempo:</p>
          <div className="w-70">
            <DatePickerInput
              type="range"
              placeholder="Pick date"
              value={dateValue}
              onChange={setDateValue}
            />
          </div>
        </div>

        <div className="min-w-12">
          <SegmentedControl
            value={graphMode}
            className="flex md:max-xl:flex-col min-w-12"
            onChange={setGraphMode}
            data={[
              { label: "Percent", value: "percent" },
              { label: "Stacked", value: "stacked" },
            ]}
          />
        </div>

        <Checkbox
          label={"Mostrar unidades inactivas"}
          checked={showInactive}
          onChange={(event) => setShowInactive(event.currentTarget.checked)}
        />
        <Select
          className="md:flex space-y-2 md:space-y-0 gap-3 items-center"
          styles={{
            label: { fontSize: 16 },
          }}
          label="Filtrar por cliente:"
          placeholder="Todos"
          data={clients}
          onChange={(value: string | null) => setClientValue(value)}
        ></Select>
      </div>

      {areaPlotData && (
        <div className="mt-8">
          <AreaChart
            //strokeWidth={0.5}
            h={500}
            data={areaPlotData}
            dataKey="fecha"
            tooltipAnimationDuration={200}
            type={graphMode as AreaChartType}
            dotProps={{ r: 0 }}
            tooltipProps={{
              content: ({ label, payload }) => (
                <ChartTooltip label={label} payload={payload} />
              ),
            }}
            series={
              showInactive
                ? [
                    { name: "Inactivo", color: "gray" },
                    { name: "Funcionando", color: "blue" },
                    { name: "Normal", color: "green" },
                    { name: "Alerta", color: "yellow.5" },
                    { name: "Fallando", color: "orange" },
                    { name: "Crítico", color: "red" },
                  ]
                : [
                    { name: "Funcionando", color: "blue" },
                    { name: "Normal", color: "green" },
                    { name: "Alerta", color: "yellow.5" },
                    { name: "Fallando", color: "orange" },
                    { name: "Crítico", color: "red" },
                  ]
            }
            curveType="monotone"
          />
        </div>
      )}
    </section>
  );
};

const ChartTooltip = ({ label, payload }: ChartTooltipProps) => {
  if (!payload) return null;
  const unitsPerCategory = getFilteredChartTooltipPayload(payload).map(
    (a) => a.value
  );

  const totalUnits = unitsPerCategory.reduce(
    (partialSum, a) => partialSum + a,
    0
  );

  return (
    <Paper px="md" py="sm" withBorder shadow="md" radius="md">
      <Text fw={500} mb={5}>
        {label}
      </Text>
      <Text fw={500} mb={5}>
        Total: {totalUnits}
      </Text>
      {getFilteredChartTooltipPayload(payload).map((item: any) => (
        <Text key={item.name} fz="sm">
          {item.name}: {item.value}
          {"  "}({((item.value / totalUnits) * 100).toFixed(0)}%)
        </Text>
      ))}
    </Paper>
  );
};

export default SafeDrivingPage;

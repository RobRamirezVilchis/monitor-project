"use client";

import {
  useIndustryAreaPlotData,
  useIndustryClientsQuery,
  useSmartBuildingsAreaPlotData,
  useSmartBuildingsClientsQuery,
} from "@/api/queries/monitor";
import { useState } from "react";

import {
  AreaChart,
  AreaChartType,
  ChartTooltipProps,
  getFilteredChartTooltipPayload,
} from "@mantine/charts";
import { Paper, SegmentedControl, Select, Text } from "@mantine/core";

import { DatePickerInput } from "@mantine/dates";

type StatusKey = 0 | 1 | 2 | 3 | 4 | 5;

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

const SmartRetailStatisticsPage = () => {
  const [clientValue, setClientValue] = useState<string | null>(null);
  const [graphMode, setGraphMode] = useState<string>("stacked");

  const currentDate = new Date();
  let yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const [dateValue, setDateValue] = useState<[Date | null, Date | null]>([
    yesterday,
    currentDate,
  ]);

  const clientsQuery = useSmartBuildingsClientsQuery({
    refetchOnWindowFocus: false,
  });
  const clients = clientsQuery.data?.map((data) => data.name);

  const areaPlotDataQuery = useSmartBuildingsAreaPlotData({
    variables: {
      timestamp_after: dateValue[0],
      timestamp_before: dateValue[1],
      client: clientValue,
    },
  });
  const areaPlotQueryData = areaPlotDataQuery?.data;

  const areaPlotData: {
    fecha: Date;
    Crítico: number;
    Alerta: number;
    Funcionando: number;
  }[] = [];

  if (areaPlotQueryData) {
    for (const hourCount of areaPlotQueryData) {
      areaPlotData.push({
        fecha: hourCount.timestamp,
        Crítico: hourCount.severity_counts["5"]
          ? hourCount.severity_counts["5"]
          : 0,
        Alerta: hourCount.severity_counts["3"]
          ? hourCount.severity_counts["3"]
          : 0,
        Funcionando: hourCount.severity_counts["1"]
          ? hourCount.severity_counts["1"]
          : 0,
      });
    }
  }

  return (
    <section className="mb-28">
      <h2 className="text-2xl mb-2 md:mb-4 opacity-50">
        Estatus general en el tiempo
      </h2>

      <div className="md:flex items-center mb-6 gap-4 md:gap-8 space-y-4 md:space-y-0 justify-start">
        <div className="md:flex gap-0 sm:gap-2 items-center">
          <p className="hidden md:block">Rango de tiempo:</p>
          <DatePickerInput
            type="range"
            placeholder="Pick date"
            value={dateValue}
            onChange={setDateValue}
          />
        </div>
        <div className="min-w-12">
          <SegmentedControl
            className="flex md:max-xl:flex-col min-w-12"
            value={graphMode}
            onChange={setGraphMode}
            data={[
              { label: "Percent", value: "percent" },
              { label: "Stacked", value: "stacked" },
            ]}
          />
        </div>

        <Select
          className="md:flex space-y-2 md:space-y-0 gap-3 items-center"
          styles={{
            label: { fontSize: 18 },
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
            h={500}
            data={areaPlotData}
            dataKey="fecha"
            tooltipProps={{
              content: ({ label, payload }) => (
                <ChartTooltip label={label} payload={payload} />
              ),
            }}
            tooltipAnimationDuration={200}
            type={graphMode as AreaChartType}
            dotProps={{ r: 0 }}
            series={[
              { name: "Funcionando", color: "blue" },
              { name: "Alerta", color: "yellow.5" },
              { name: "Crítico", color: "red" },
            ]}
            curveType="step"
          />
        </div>
      )}
    </section>
  );
};

const ChartTooltip = ({ label, payload }: ChartTooltipProps) => {
  if (!payload) return null;
  const devicesPerCategory = getFilteredChartTooltipPayload(payload).map(
    (a) => a.value
  );

  const totalDevices = devicesPerCategory.reduce(
    (partialSum, a) => partialSum + a,
    0
  );

  return (
    <Paper px="md" py="sm" withBorder shadow="md" radius="md">
      <Text fw={500} mb={5}>
        {label}
      </Text>
      <Text fw={500} mb={5}>
        Total: {totalDevices}
      </Text>
      {getFilteredChartTooltipPayload(payload).map((item: any) => (
        <Text key={item.name} fz="sm">
          {item.name}: {item.value}
        </Text>
      ))}
    </Paper>
  );
};

export default SmartRetailStatisticsPage;

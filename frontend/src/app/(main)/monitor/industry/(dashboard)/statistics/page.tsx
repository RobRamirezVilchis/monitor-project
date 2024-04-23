"use client";

import { useCallback, useEffect, useState } from "react";
import {
  useDevicesQuery,
  useIndustryAreaPlotData,
  useIndustryClientsQuery,
  useIndustryLastUpdateQuery,
  useIndustrySeverityCount,
  useSafeDrivingAreaPlotData,
} from "@/api/queries/monitor";

import {
  Checkbox,
  Paper,
  Text,
  SegmentedControl,
  Tabs,
  TextInput,
  Select,
} from "@mantine/core";
import {
  AreaChart,
  AreaChartType,
  ChartTooltipProps,
  PieChart,
  getFilteredChartTooltipPayload,
} from "@mantine/charts";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DatePickerInput } from "@mantine/dates";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

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

const IndustryStatisticsPage = () => {
  const router = useRouter();
  const [clientValue, setClientValue] = useState<string | null>(null);
  const [graphMode, setGraphMode] = useState<string>("stacked");
  const [showInactive, setShowInactive] = useState<boolean>(false);
  const searchParams = useSearchParams();

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

  const clientsQuery = useIndustryClientsQuery({
    refetchOnWindowFocus: false,
  });
  const clients = clientsQuery.data?.map((data) => data.name);

  const areaPlotDataQuery = useIndustryAreaPlotData({
    variables: {
      timestamp_after: dateValue[0],
      timestamp_before: dateValue[1],
      client: clientValue,
    },
  });
  const areaPlotQueryData = areaPlotDataQuery?.data;

  const countQuery = useIndustrySeverityCount({
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
    <section>
      <div className="md:flex items-center mb-6">
        <h2 className="text-xl mb-2 md:mb-0">
          Gráfica de estátus en el tiempo:
        </h2>
        <div className="md:flex space-y-4 md:space-y-0 gap-10 items-center">
          <div className="w-70 ml-0 md:ml-4 mr-0">
            <DatePickerInput
              type="range"
              placeholder="Pick date"
              value={dateValue}
              onChange={setDateValue}
            />
          </div>
          <SegmentedControl
            value={graphMode}
            onChange={setGraphMode}
            data={[
              { label: "Percent", value: "percent" },
              { label: "Stacked", value: "stacked" },
            ]}
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
            series={
              showInactive
                ? [
                    { name: "Funcionando", color: "blue" },
                    { name: "Alerta", color: "yellow.5" },
                    { name: "Crítico", color: "red" },
                  ]
                : [
                    { name: "Funcionando", color: "blue" },
                    { name: "Alerta", color: "yellow.5" },
                    { name: "Crítico", color: "red" },
                  ]
            }
            curveType="bump"
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

export default IndustryStatisticsPage;

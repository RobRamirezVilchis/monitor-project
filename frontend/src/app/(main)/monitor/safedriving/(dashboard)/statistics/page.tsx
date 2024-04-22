"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Checkbox,
  Paper,
  Text,
  SegmentedControl,
  Tabs,
  rem,
} from "@mantine/core";
import {
  AreaChart,
  AreaChartType,
  ChartTooltipProps,
  getFilteredChartTooltipPayload,
} from "@mantine/charts";
import { TextInput, useCombobox, Select } from "@mantine/core";
import { PieChart } from "@mantine/charts";

import {
  useUnitsQuery,
  useDrivingSeverityCount,
  useSafeDrivingClientsQuery,
  useSafeDrivingAreaPlotData,
  useDrivingLastUpdateQuery,
} from "@/api/queries/monitor";

import UnitCard from "../../../(components)/UnitCard";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { DatePickerInput } from "@mantine/dates";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { ConstructionOutlined, Pause } from "@mui/icons-material";

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
  const [graphMode, setGraphMode] = useState<string>("percent");
  const [showInactive, setShowInactive] = useState<boolean>(false);
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

  const areaPlotDataQuery = useSafeDrivingAreaPlotData({
    variables: {
      timestamp_after: dateValue[0],
      timestamp_before: dateValue[1],
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
    <section className="mb-20">
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
          <Checkbox
            label={"Mostrar unidades inactivas"}
            checked={showInactive}
            onChange={(event) => setShowInactive(event.currentTarget.checked)}
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
        </Text>
      ))}
    </Paper>
  );
};

export default SafeDrivingPage;

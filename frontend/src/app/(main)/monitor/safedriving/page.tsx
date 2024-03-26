"use client";

import { useCallback, useState } from "react";

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

import {
  useUnitsQuery,
  useDrivingSeverityCount,
  useSafeDrivingClientsQuery,
} from "@/api/queries/monitor";

import UnitCard from "../(components)/UnitCard";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  const countQuery = useDrivingSeverityCount({
    refetchOnWindowFocus: false,
  });
  const clientsQuery = useSafeDrivingClientsQuery({
    refetchOnWindowFocus: false,
  });

  const clients = clientsQuery.data?.map((data) => data.name);

  const unitData = unitsStatusQuery.data;

  return (
    <section>
      <div className="flex items-center">
        <h1 className="text-5xl font-bold py-2 flex-1 my-6">Safe Driving</h1>
        <ColorSchemeSwitchToggle />
      </div>

      <div className="md:flex mb-4 gap-10">
        <TextInput
          className="flex gap-3 items-center w-100 "
          styles={{
            label: { fontSize: 18 },
          }}
          label="Buscar unidad:"
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
        />
        <div className="flex mt-2 md:mt-0 items-center w-96 gap-4">
          <div className="w-96">
            <Select
              className="flex gap-3 items-center w-100 "
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
      </div>

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
                  filter == null || Number(filter) != severity_count.severity
                    ? "/monitor/safedriving/?" +
                      createQueryString(
                        "filter",
                        String(severity_count.severity)
                      )
                    : "/monitor/safedriving/"
                }
                className={`${
                  severity_count.severity == Number(filter) || filter == null
                    ? "opacity-100"
                    : "opacity-30"
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

      <div className="flex flex-row gap-4 flex-wrap">
        {unitData?.map((unit) =>
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

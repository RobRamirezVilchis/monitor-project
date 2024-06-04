"use client";

import {
  useAllRDSStatusQuery,
  useRDSRegionsQuery,
  useRDSStatusQuery,
  useRDSTypesQuery,
} from "@/api/queries/monitor";
import ServerCard from "../../../../(components)/ServerCard";
import { Select, TextInput } from "@mantine/core";
import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import RDSCard from "@/app/(main)/monitor/(components)/RDSCard";

const RDSDetailPage = () => {
  const router = useRouter();

  const [nameInput, setNameInput] = useState<string>("");

  const [rdsType, setRdsType] = useState<string | null>(null);
  const [rdsRegion, setRdsRegion] = useState<string | null>(null);

  const rdsStatusQuery = useAllRDSStatusQuery({
    variables: {
      region: rdsRegion,
      instance_class: rdsType,
    },
  });
  const rdsStatus = rdsStatusQuery.data;

  const rdsTypesQuery = useRDSTypesQuery({});
  const rdsTypes = rdsTypesQuery.data?.map((data) => data.instance_class);

  const rdsRegionsQuery = useRDSRegionsQuery({});
  const rdsRegions = rdsRegionsQuery.data?.map((data) => data.name);

  const searchParams = useSearchParams();

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

  return (
    <section>
      <div className="md:flex flex-wrap space-y-2 sm:space-y-0 gap-6 mb-4">
        <TextInput
          className="md:flex gap-3 items-center "
          styles={{
            label: { fontSize: 18 },
          }}
          label="Buscar base de datos:"
          value={nameInput}
          onChange={(event) => setNameInput(event.currentTarget.value)}
        />
        <div className="md:flex gap-2">
          <p className="text-lg mt-1">Filtros:</p>
          <Select
            className="md:flex gap-3 items-center"
            styles={{
              label: { fontSize: 18 },
            }}
            placeholder="Región"
            data={rdsRegions}
            value={rdsRegion}
            onChange={(value: string | null) => {
              router.push(
                value
                  ? "/monitor/services/rds/details/?" +
                      createQueryString("region", value)
                  : "/monitor/services/rds/details/?" +
                      removeQueryParam("region")
              );
              setRdsRegion(value);
            }}
          ></Select>
          <Select
            className="md:flex gap-3 items-center"
            styles={{
              label: { fontSize: 18 },
            }}
            placeholder="Tamaño"
            data={rdsTypes}
            value={rdsType}
            onChange={(value: string | null) => {
              router.push(
                value
                  ? "/monitor/services/rds/details/?" +
                      createQueryString("type", value)
                  : "/monitor/services/rds/details/?" + removeQueryParam("type")
              );
              setRdsType(value);
            }}
          ></Select>
        </div>
      </div>
      <div className="flex flex-row gap-4 flex-wrap">
        {rdsStatus
          ?.sort((x) => -+x.critical)
          ?.map(
            (rdsStatus) =>
              rdsStatus.name
                .toLowerCase()
                .includes(nameInput.toLowerCase().replace(" ", "_")) && (
                <RDSCard key={rdsStatus.rds_id} {...rdsStatus}></RDSCard>
              )
          )}
      </div>
    </section>
  );
};

export default RDSDetailPage;

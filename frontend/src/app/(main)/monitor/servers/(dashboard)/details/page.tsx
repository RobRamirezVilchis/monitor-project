"use client";

import {
  useServerRegionsQuery,
  useServerTypesQuery,
  useServersStatusQuery,
} from "@/api/queries/monitor";
import ServerCard from "../../../(components)/ServerCard";
import { Select, TextInput } from "@mantine/core";
import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const ServersDetailPage = () => {
  const router = useRouter();

  const [nameInput, setNameInput] = useState<string>("");

  const [serverType, setServerType] = useState<string | null>(null);
  const [serverRegion, setServerRegion] = useState<string | null>(null);

  const serversStatusQuery = useServersStatusQuery({
    variables: {
      region: serverRegion,
      server_type: serverType,
    },
  });
  const serversStatus = serversStatusQuery.data;

  const serverTypesQuery = useServerTypesQuery({});
  const serverTypes = serverTypesQuery.data?.map((data) => data.server_type);

  const serverRegionsQuery = useServerRegionsQuery({});
  const serverRegions = serverRegionsQuery.data?.map((data) => data.name);

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
          label="Buscar servidor:"
          value={nameInput}
          onChange={(event) => setNameInput(event.currentTarget.value)}
        />
        <Select
          className="md:flex gap-3 items-center"
          styles={{
            label: { fontSize: 18 },
          }}
          label="Filtrar por región:"
          placeholder="Todas"
          data={serverRegions}
          value={serverRegion}
          onChange={(value: string | null) => {
            router.push(
              value
                ? "/monitor/servers/details/?" +
                    createQueryString("region", value)
                : "/monitor/servers/details/?" + removeQueryParam("region")
            );
            setServerRegion(value);
          }}
        ></Select>
        <Select
          className="md:flex gap-3 items-center"
          styles={{
            label: { fontSize: 18 },
          }}
          label="Filtrar por tamaño:"
          placeholder="Todos"
          data={serverTypes}
          value={serverType}
          onChange={(value: string | null) => {
            router.push(
              value
                ? "/monitor/servers/details/?" +
                    createQueryString("type", value)
                : "/monitor/servers/details/?" + removeQueryParam("type")
            );
            setServerType(value);
          }}
        ></Select>
      </div>
      <div className="flex flex-row gap-4 flex-wrap">
        {serversStatus?.map(
          (serverStatus) =>
            serverStatus.server_name
              .toLowerCase()
              .includes(nameInput.toLowerCase().replace(" ", "_")) && (
              <ServerCard
                key={serverStatus.server_id}
                {...serverStatus}
              ></ServerCard>
            )
        )}
      </div>
    </section>
  );
};

export default ServersDetailPage;

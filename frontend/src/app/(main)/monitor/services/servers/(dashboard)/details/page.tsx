"use client";

import {
  useProjectsQuery,
  useServerRegionsQuery,
  useServerTypesQuery,
  useServersProjectsQuery,
  useServersStatusQuery,
} from "@/api/queries/monitor";
import ServerCard from "../../../../(components)/ServerCard";
import { Select, TextInput } from "@mantine/core";
import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const ServersDetailPage = () => {
  const router = useRouter();

  const [nameInput, setNameInput] = useState<string>("");

  const [serverType, setServerType] = useState<string | null>(null);
  const [projectFilter, setProject] = useState<string | null>(null);
  const [serverRegion, setServerRegion] = useState<string | null>(null);

  const serversStatusQuery = useServersStatusQuery({
    variables: {
      region: serverRegion,
      server_type: serverType,
    },
  });
  const serversStatus = serversStatusQuery.data;

  const serverProjectsData = useServersProjectsQuery({}).data;

  let serverProjects: { [id: number]: string[] } = {};
  if (serverProjectsData) {
    for (const project of serverProjectsData) {
      serverProjects[project.server_id] = project.projects;
    }
  }

  const projects = useProjectsQuery({}).data?.map(
    (obj, index) => `${index + 1}. ${obj.name}`
  );

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
    <section className="mb-20">
      <div className="md:flex flex-wrap space-y-2 sm:space-y-0 gap-6 mb-4 items-center">
        <TextInput
          className="md:flex gap-3 items-center "
          styles={{
            label: { fontSize: 18 },
          }}
          label="Buscar servidor:"
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
            data={serverRegions}
            value={serverRegion}
            onChange={(value: string | null) => {
              router.push(
                value
                  ? "/monitor/services/servers/details/?" +
                      createQueryString("region", value)
                  : "/monitor/services/servers/details/?" +
                      removeQueryParam("region")
              );
              setServerRegion(value);
            }}
          ></Select>
          <Select
            className="md:flex gap-3 items-center"
            styles={{
              label: { fontSize: 18 },
            }}
            placeholder="Tamaño"
            data={serverTypes}
            value={serverType}
            onChange={(value: string | null) => {
              router.push(
                value
                  ? "/monitor/services/servers/details/?" +
                      createQueryString("type", value)
                  : "/monitor/services/servers/details/?" +
                      removeQueryParam("type")
              );
              setServerType(value);
            }}
          ></Select>
          <Select
            className="md:flex gap-3 items-center"
            styles={{
              label: { fontSize: 18 },
            }}
            placeholder="Proyecto"
            data={projects}
            value={projectFilter}
            onChange={(value: string | null) => {
              router.push(
                value
                  ? "/monitor/services/servers/details/?" +
                      createQueryString("project", value)
                  : "/monitor/services/servers/details/?" +
                      removeQueryParam("project")
              );
              setProject(value);
            }}
          ></Select>
        </div>
      </div>
      {serverProjects && (
        <div className="flex flex-row gap-4 flex-wrap">
          {serversStatus
            ?.sort((x) => -+x.critical)
            ?.map(
              (serverStatus) =>
                serverStatus.server_name
                  .toLowerCase()
                  .includes(nameInput.toLowerCase().replace(" ", "_")) &&
                (projectFilter == null ||
                  serverProjects[serverStatus.server_id].includes(
                    projectFilter.split(".")[1].slice(1)
                  )) &&
                !(serverProjects[serverStatus.server_id] == null) && (
                  <ServerCard
                    key={serverStatus.server_id}
                    projects={serverProjects[serverStatus.server_id]}
                    serverStatus={serverStatus}
                  ></ServerCard>
                )
            )}
        </div>
      )}
    </section>
  );
};

export default ServersDetailPage;

"use client";

import {
  useAllLoadBalancerStatusQuery,
  useLoadBalancerRegionsQuery,
} from "@/api/queries/monitor";
import ServerCard from "../../../../(components)/ServerCard";
import { Select, TextInput } from "@mantine/core";
import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import RDSCard from "@/app/(main)/monitor/(components)/RDSCard";
import LoadBalancerCard from "@/app/(main)/monitor/(components)/LoadBalancerCard";

const LoadBalancerDetailPage = () => {
  const router = useRouter();

  const [nameInput, setNameInput] = useState<string>("");

  const [elbRegion, setElbRegion] = useState<string | null>(null);

  const elbStatusQuery = useAllLoadBalancerStatusQuery({
    variables: {
      region: elbRegion,
    },
  });
  const elbStatus = elbStatusQuery.data;

  const rdsRegionsQuery = useLoadBalancerRegionsQuery({});
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
          label="Buscar distribuidor:"
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
          data={rdsRegions}
          value={elbRegion}
          onChange={(value: string | null) => {
            router.push(
              value
                ? "/monitor/services/load-balancers/details/?" +
                    createQueryString("region", value)
                : "/monitor/services/load-balancers/details/?" +
                    removeQueryParam("region")
            );
            setElbRegion(value);
          }}
        ></Select>
      </div>
      <div className="flex flex-row gap-4 flex-wrap">
        {elbStatus
          ?.sort((x) => -+x.critical)
          ?.map(
            (elbStatus) =>
              elbStatus.name
                .toLowerCase()
                .includes(nameInput.toLowerCase().replace(" ", "_")) && (
                <LoadBalancerCard
                  key={elbStatus.elb_id}
                  {...elbStatus}
                ></LoadBalancerCard>
              )
          )}
      </div>
    </section>
  );
};

export default LoadBalancerDetailPage;

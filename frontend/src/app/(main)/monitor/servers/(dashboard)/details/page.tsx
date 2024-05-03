"use client";

import { useServersStatusQuery } from "@/api/queries/monitor";
import ServerCard from "../../../(components)/ServerCard";

const ServersDetailPage = () => {
  const serversStatusQuery = useServersStatusQuery({});
  const serversStatus = serversStatusQuery.data;

  console.log(serversStatusQuery.data);
  return (
    <div className="flex flex-row gap-4 flex-wrap">
      {serversStatus?.map((serverStatus) => (
        <ServerCard {...serverStatus}></ServerCard>
      ))}
    </div>
  );
};

export default ServersDetailPage;

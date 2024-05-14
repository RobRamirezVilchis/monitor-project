"use client";

import { ReactNode, useState } from "react";
import "@mantine/charts/styles.css";
import { Button, Tabs } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import path from "path";
import { formatDistanceToNow } from "date-fns";
import { useDrivingLastUpdateQuery } from "@/api/queries/monitor";
import { es } from "date-fns/locale";

const ServersDashboardLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const currentTab = pathname.split("/").slice(-1)[0];

  return (
    <section>
      <Tabs value={currentTab}>
        <div className="md:flex md:items-center pb-2 mb-3 md:mb-6 justify-left 2xl:justify-between">
          <div className="md:flex md:items-center">
            <h1 className="mb-4 md:mb-0 text-5xl font-bold pr-10 ">
              Servidores
            </h1>
            {/* <Tabs.List>
              <Link href="/monitor/servers/details">
                <Tabs.Tab className="text-lg" value="details">
                  Detalles
                </Tabs.Tab>
              </Link>
              <Link href="/monitor/servers/statistics">
                <Tabs.Tab className="text-lg" value="statistics">
                  Estadísticas
                </Tabs.Tab>
              </Link>
            </Tabs.List> */}
          </div>
        </div>
        <div>{children}</div>
      </Tabs>
    </section>
  );
};

export default ServersDashboardLayout;

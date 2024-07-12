"use client";

import { ReactNode } from "react";
import "@mantine/charts/styles.css";
import { Button, Tabs } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

const ServicesDashboardLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const currentTab = pathname.split("/").slice(-2, -1)[0];

  return (
    <section>
      <Tabs color="gray.6" value={currentTab}>
        <div className="md:flex md:items-center pb-2 mb-3 md:mb-6 justify-left xl:justify-between">
          <div className="md:flex md:items-center mr-3 xl:mr-0 mb-2 sm:mb-0">
            <h1 className="mb-4  md:mb-0 text-5xl font-bold pr-10 ">
              Servicios
            </h1>
            <Tabs.List color="green">
              <Link href="/monitor/services/servers/details">
                <Tabs.Tab className="text-lg" value="servers">
                  Servidores
                </Tabs.Tab>
              </Link>
              <Link href="/monitor/services/rds/details">
                <Tabs.Tab className="text-lg" value="rds">
                  Bases de datos
                </Tabs.Tab>
              </Link>
              <Link href="/monitor/services/load-balancers/details">
                <Tabs.Tab className="text-lg" value="load-balancers">
                  Distribuidores de carga
                </Tabs.Tab>
              </Link>
            </Tabs.List>
          </div>
          <Link href={"/monitor/services/new-project"}>
            <Button color="green.7">Nuevo proyecto</Button>
          </Link>
        </div>
        <div>{children}</div>
      </Tabs>
    </section>
  );
};

export default ServicesDashboardLayout;

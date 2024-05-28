"use client";

import { ReactNode } from "react";
import "@mantine/charts/styles.css";
import { Button, Tabs } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

const ServersDashboardLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const currentTab = pathname.split("/").slice(-2, -1)[0];

  return (
    <section>
      <Tabs value={currentTab}>
        <div className="sm:flex mb-3 justify-between items-start">
          <div className="md:flex md:items-center pb-2 mb-3 md:mb-6 justify-left 2xl:justify-between">
            <div className="md:flex md:items-center">
              <h1 className="mb-4 md:mb-0 text-5xl font-bold pr-10 ">
                Servicios
              </h1>
              <Tabs.List>
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
              </Tabs.List>
            </div>
          </div>
          <Link href={"/monitor/services/new-project"}>
            <Button
              color="gray.5"
              classNames={{ root: "dark:bg-gray-800 dark:hover:bg-gray-700" }}
            >
              Nuevo proyecto
            </Button>
          </Link>
        </div>
        <div>{children}</div>
      </Tabs>
    </section>
  );
};

export default ServersDashboardLayout;

"use client";

import { ReactNode } from "react";
import "@mantine/charts/styles.css";
import { Button, Tabs } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import ServicesDashboardLayout from "../../../(components)/ServicesDashboardLayout";

const ServersDashboardLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const currentTab = pathname.split("/").slice(-2, -1)[0];

  return (
    <section>
      <ServicesDashboardLayout>{children}</ServicesDashboardLayout>
    </section>
  );
};

export default ServersDashboardLayout;

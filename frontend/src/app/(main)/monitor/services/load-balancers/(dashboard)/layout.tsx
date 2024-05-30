"use client";

import { ReactNode } from "react";
import "@mantine/charts/styles.css";
import { Tabs } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import ServicesDashboardLayout from "../../../(components)/ServicesDashboardLayout";

const LoadBalancersDashboardLayout = ({
  children,
}: {
  children: ReactNode;
}) => {
  return <ServicesDashboardLayout>{children}</ServicesDashboardLayout>;
};

export default LoadBalancersDashboardLayout;

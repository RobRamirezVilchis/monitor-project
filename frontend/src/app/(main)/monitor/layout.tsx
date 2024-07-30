"use client";

import { ReactNode } from "react";
import "@mantine/charts/styles.css";
import { withAuth } from "@/components/auth/withAuth";

const MonitorLayout = ({ children }: { children: ReactNode }) => {
  return (
    <section className="mx-8 lg:mx-32 pb-2 md:pb-6 pt-10">{children}</section>
  );
};

// export default withAuth(MonitorLayout);
export default MonitorLayout;

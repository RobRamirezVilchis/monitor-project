import { ReactNode, useMemo, useState } from "react";
import "@mantine/charts/styles.css";

const MonitorLayout = ({ children }: { children: ReactNode }) => {
  return (
    <section className="flex flex-col mx-8 lg:mx-32 pb-2 md:pb-6">
      {children}
    </section>
  );
};

export default MonitorLayout;

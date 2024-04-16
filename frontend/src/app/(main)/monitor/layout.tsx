import { ReactNode } from "react";
import "@mantine/charts/styles.css";

const MonitorLayout = ({ children }: { children: ReactNode }) => {
  return <section>{children}</section>;
};

export default MonitorLayout;

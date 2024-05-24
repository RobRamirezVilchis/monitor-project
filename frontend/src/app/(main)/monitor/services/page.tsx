import { redirect } from "next/navigation";

const MonitorPage = () => {
  redirect("/monitor/services/servers/details");
};

export default MonitorPage;

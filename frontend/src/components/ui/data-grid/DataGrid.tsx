import { ScrollProvider } from "./components/ScrollProvider";
import DataGridBody from "./DataGridBody";
import DataGridColumnHeaders from "./DataGridColumnHeaders";

const DataGrid = () => {
  return (
    <ScrollProvider>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
        className="border border-blue-500"
      >
        <DataGridColumnHeaders />
        <DataGridBody />
      </div>
    </ScrollProvider>
  );
};

export default DataGrid;
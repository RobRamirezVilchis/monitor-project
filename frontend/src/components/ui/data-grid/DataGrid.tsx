import { ScrollsProvider } from "./ScrollsProvider";
import DataGridBody from "./DataGridBody";
import DataGridColumnHeaders from "./DataGridColumnHeaders";

const DataGrid = () => {
  return (
    <ScrollsProvider>
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
    </ScrollsProvider>
  );
};

export default DataGrid;
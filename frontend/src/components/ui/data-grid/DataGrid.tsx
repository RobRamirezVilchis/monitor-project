import { ScrollProvider } from "./components/ScrollProvider";
import DataGridBody from "./DataGridBody";

const DataGrid = () => {
  return (
    <ScrollProvider>
      <DataGridBody />
    </ScrollProvider>
  );
};

export default DataGrid;
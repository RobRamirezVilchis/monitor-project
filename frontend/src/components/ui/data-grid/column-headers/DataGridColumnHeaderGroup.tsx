import { RowData, HeaderGroup } from "@tanstack/react-table";
import clsx from "clsx";

import gridHeaderGroupStyles from "./DataGridColumnHeaderGroup.module.css";

import { useDataGridContext } from "../providers/DataGridContext";
import DataGridColumnHeaderCell from "./DataGridColumnHeaderCell";

export interface DataGridColumnHeaderGroupProps<TData extends RowData> {
  group: HeaderGroup<TData>;
}

const DataGridColumnHeaderGroup = <TData extends RowData>({
  group,
}: DataGridColumnHeaderGroupProps<TData>) => {
  const { classNames, styles } = useDataGridContext();

  return (
    <div
      className={clsx("DataGridColumnHeaderGroup-root", gridHeaderGroupStyles.root, classNames?.columnHeaderGroup?.root)}
      style={styles?.columnHeaderGroup?.root}
    >
      {/* Headers */}
      {group.headers.map(header => (
        // Header Cell
        <DataGridColumnHeaderCell key={header.id} header={header} />
      ))}
    </div>
  )
}

export default DataGridColumnHeaderGroup;

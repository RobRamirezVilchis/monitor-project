import { Header, RowData, flexRender } from "@tanstack/react-table";
import clsx from "clsx";

import gridHeaderCellStyles from "./DataGridColumnHeaderCell.module.css";

import { useDataGridContext } from "../providers/DataGridContext";
import ColumnSortingToggle from "../components/ColumnSortingToggle";
import ColumnMenu from "../components/ColumnMenu";
import DataGridColumnHeaderCellContent from "./DataGridColumnHeaderCellContent";
import ResizeHandler from "./ResizeHandler";

export interface DataGridColumnHeaderCellProps<TData extends RowData, TValue> {
  header: Header<TData, TValue>;
}

const DataGridColumnHeaderCell = <TData extends RowData, TValue>({
  header,
}: DataGridColumnHeaderCellProps<TData, TValue>) => {
  const { classNames, styles } = useDataGridContext();
  
  return (
    <div
      className={clsx("DataGridColumnHeaderCell-root", gridHeaderCellStyles.root, classNames?.columnHeaderCell?.root)}
      style={{
        ...styles?.columnHeaderCell?.root,
        width: header.getSize(),
      }}
    >
      {/* Content */}
      {!header.isPlaceholder ? (
        <div
          className={clsx("DataGridColumnHeaderCell-content", gridHeaderCellStyles.content, classNames?.columnHeaderCell?.content)}
          style={styles?.columnHeaderCell?.content}
        >
          <DataGridColumnHeaderCellContent header={header} />
        </div>
      ) : null}
    </div>
  );
}

export default DataGridColumnHeaderCell;

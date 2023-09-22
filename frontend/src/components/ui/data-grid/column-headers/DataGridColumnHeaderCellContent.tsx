import { Header, RowData, flexRender } from "@tanstack/react-table";
import clsx from "clsx";

import gridHeaderCellStyles from "./DataGridColumnHeaderCell.module.css";

import { useDataGridContext } from "../providers/DataGridContext";
import ColumnSortingToggle from "../components/ColumnSortingToggle";
import ColumnMenu from "../components/ColumnMenu";
import ResizeHandler from "./ResizeHandler";

export interface DataGridColumnHeaderCellContentProps<TData extends RowData, TValue> {
  header: Header<TData, TValue>;
}

const DataGridColumnHeaderCellContent = <TData extends RowData, TValue>({
  header,
}: DataGridColumnHeaderCellContentProps<TData, TValue>) => {
  const { classNames, styles } = useDataGridContext();
  
  return (<>
    <div
      className={clsx("DataGridColumnHeaderCell-contentLabel", gridHeaderCellStyles.contentLabel, classNames?.columnHeaderCell?.contentLabel)}
      style={styles?.columnHeaderCell?.content}
    >
      <div
        className={clsx("DataGridColumnHeaderCell-label", gridHeaderCellStyles.label, classNames?.columnHeaderCell?.label)}
        style={styles?.columnHeaderCell?.label}
      >
        {flexRender(header.column.columnDef.header, header.getContext())}
      </div>

      {header.subHeaders.length === 0 ? (
        <div
          className={clsx("DataGridColumnHeaderCell-actions", gridHeaderCellStyles.actions, classNames?.columnHeaderCell?.actions)}
          style={styles?.columnHeaderCell?.actions}
        >
          {header.column.getCanSort() ? <ColumnSortingToggle header={header} /> : null}
          <ColumnMenu header={header} />
          {header.column.getCanResize() ? <ResizeHandler header={header} /> : null}
        </div>) 
      : null}
    </div>

    {header.column.getCanFilter() && header.subHeaders.length === 0 ? (
      <div
        className={clsx("DataGridColumnHeaderCell-filter", gridHeaderCellStyles.filter, classNames?.columnHeaderCell?.filter)}
        style={styles?.columnHeaderCell?.filters}
      >
        Filters
      </div>
    ) : null}
  </>);
}

export default DataGridColumnHeaderCellContent;

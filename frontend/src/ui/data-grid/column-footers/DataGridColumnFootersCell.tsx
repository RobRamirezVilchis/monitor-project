import { RowData, flexRender } from "@tanstack/react-table";
import clsx from "clsx";

import styles from "./DataGridColumnFootersCell.module.css";

import { DataGridInstance, Header } from "../types";


export interface DataGridColumnFooterCellProps<TData extends RowData, TValue> {
  instance: DataGridInstance<TData>;
  header: Header<TData, TValue>;
}

const DataGridColumnFooterCell = <TData extends RowData, TValue>({
  instance,
  header,
}: DataGridColumnFooterCellProps<TData, TValue>) => {
  const columnDef = header.column.columnDef;
  const colDefClassNames = typeof columnDef.headerClassNames === "function"
    ? columnDef.headerClassNames(header)
    : columnDef.headerClassNames;

  return (
    <div
      className={clsx(
        "DataGridColumnFootersCell-root", 
        styles.root,
        instance.options.classNames?.columnFootersCell?.root,
        colDefClassNames?.root,
      )}
      style={{
        ...instance.options.styles?.columnFootersCell?.root,
        ...columnDef.footerStyles?.root,
        width: header.getSize(),
        minHeight: instance.getDensityModel().headerHeight,
      }}
      role="columnheaders"
    >
      {/* Content */}
      {!header.isPlaceholder ? (
        <div
          className={clsx("DataGridColumnFootersCell-content", styles.content, instance.options.classNames?.columnFootersCell?.content, colDefClassNames?.content)}
          style={{
            ...instance.options.styles?.columnFootersCell?.content,
            ...columnDef.footerStyles?.content,
          }}
        >
          {flexRender(header.column.columnDef.footer, header.getContext())}
        </div>
      ) : null}
    </div>
  );
}

export default DataGridColumnFooterCell;

import { RowData, flexRender } from "@tanstack/react-table";
import clsx from "clsx";

import gridFooterCellStyles from "./DataGridColumnFooterCell.module.css";

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

  return (
    <div
      className={clsx(
        "DataGridColumnHeaderCell-root", 
        gridFooterCellStyles.root,
        instance.options.classNames?.columnFooterCell?.root,
        columnDef.footerClassNames?.root,
      )}
      style={{
        ...instance.options.styles?.columnFooterCell?.root,
        ...columnDef.footerStyles?.root,
        width: header.getSize(),
        minHeight: instance.getDensityModel().headerHeight,
      }}
      role="columnheader"
    >
      {/* Content */}
      {!header.isPlaceholder ? (
        <div
          className={clsx("DataGridColumnFooterCell-content", gridFooterCellStyles.content, instance.options.classNames?.columnFooterCell?.content, columnDef.footerClassNames?.content)}
          style={{
            ...instance.options.styles?.columnFooterCell?.content,
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

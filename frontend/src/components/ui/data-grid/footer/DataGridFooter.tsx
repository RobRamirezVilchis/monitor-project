import { RowData } from "@tanstack/react-table";
import clsx from "clsx";

import gridFooterStyles from "./DataGridFooter.module.css";

import type { DataGridInstance } from "../types";
import GridPagination from "../components/GridPagination";

export interface DataGridFooterProps<TData extends RowData> {
  instance: DataGridInstance<TData>;
}

const DataGridFooter = <TData extends RowData>({
  instance,
}: DataGridFooterProps<TData>) => {
  const selectedRowModel = instance.getSelectedRowModel();

  return (
    <div
      ref={instance.refs.footer}
      className={clsx("DataGridFooter-root", gridFooterStyles.root, instance.options.classNames?.footer?.root)}
      style={instance.options.styles?.footer?.root}
    >
      {/* TODO: Use css module */}
      <div className="flex gap-2 w-full p-2">
        <div className="flex-1 flex gap-2">
          {selectedRowModel.rows.length > 0 ? (
            <span>
              {selectedRowModel.rows.length} rows selected
            </span>
          ) : null}
        </div>

        <div>
          <GridPagination instance={instance} />
        </div>
      </div>
    </div>
  )
}

export default DataGridFooter;

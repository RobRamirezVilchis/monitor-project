import { RowData } from "@tanstack/react-table";
import clsx from "clsx";

import gridFooterStyles from "./DataGridFooter.module.css";

import { useDataGridContext } from "../providers/DataGridContext";
import { useDataGridRefsContext } from "../providers/DataGridRefsProvider";
import type { DataGridInstance } from "../types";
import GridPagination from "../components/GridPagination";

export interface DataGridFooterProps<TData extends RowData> {
  instance: DataGridInstance<TData>;
}

const DataGridFooter = <TData extends RowData>({
  instance,
}: DataGridFooterProps<TData>) => {
  const { classNames, styles } = useDataGridContext();
  const { footerRef } = useDataGridRefsContext();

  return (
    <div
      ref={footerRef}
      className={clsx("DataGridFooter-root", gridFooterStyles.root, classNames?.footer?.root)}
      style={styles?.footer?.root}
    >
      {/* TODO: Use css module */}
      <div className="flex gap-2 w-full p-2">
        <div className="flex-1">
          n Rows Selected
        </div>

        <div>
          <GridPagination instance={instance} />
        </div>
      </div>
    </div>
  )
}

export default DataGridFooter;

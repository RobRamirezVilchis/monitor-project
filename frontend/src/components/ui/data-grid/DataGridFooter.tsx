import { RowData } from "@tanstack/react-table";
import clsx from "clsx";

import gridFooterStyles from "./DataGridFooter.module.css";

import { useDataGridContext } from "./DataGridContext";
import { useDataGridRefsContext } from "./DataGridRefsProvider";
import type { DataGridInstance } from "./types";

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
      Footer
    </div>
  )
}

export default DataGridFooter;

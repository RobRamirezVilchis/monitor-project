import { CSSProperties } from "react";
import { RowData } from "@tanstack/react-table";

import type { DataGridInstance } from "./types";
import clsx from "clsx";

export interface DataGridFooterClassNames {
  root?: string;
}

export interface DataGridFooterStyles {
  root?: CSSProperties;
}

export interface DataGridFooterProps<TData extends RowData> {
  instance: DataGridInstance<TData>;
  classNames?: DataGridFooterClassNames;
  styles?: DataGridFooterStyles;
}

const DataGridFooter = <TData extends RowData>({
  instance,
  classNames,
  styles,
}: DataGridFooterProps<TData>) => {
  return (
    <div
      className={clsx("DataGridFooter-root", classNames?.root)}
      style={styles?.root}
    >
      Footer
    </div>
  )
}

export default DataGridFooter;

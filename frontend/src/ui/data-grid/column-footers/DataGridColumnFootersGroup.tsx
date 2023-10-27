import { RowData } from "@tanstack/react-table";
import clsx from "clsx";

import styles from "./DataGridColumnFootersGroup.module.css";

import { DataGridInstance, HeaderGroup } from "../types";
import DataGridColumnFooterCell from "./DataGridColumnFootersCell";

export interface DataGridColumnHeadersGroupProps<TData extends RowData> {
  instance: DataGridInstance<TData>;
  group: HeaderGroup<TData>;
}

const DataGridColumnHeadersGroup = <TData extends RowData>({
  instance,
  group,
}: DataGridColumnHeadersGroupProps<TData>) => {
  return (
    <div
      className={clsx("DataGridColumnFootersGroup-root", styles.root, instance.options.classNames?.columnFootersGroup?.root)}
      style={{
        ...instance.options.styles?.columnFootersGroup?.root,
        minHeight: instance.getDensityModel().headerHeight,
      }}
      role="row"
    >
      {/* Headers */}
      {group.headers.map(header => (
        // Header Cell
        <DataGridColumnFooterCell
          key={header.id} 
          header={header} 
          instance={instance}
        />
      ))}
    </div>
  )
}

export default DataGridColumnHeadersGroup;

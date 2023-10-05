import { RowData } from "@tanstack/react-table";
import clsx from "clsx";

import gridFooterGroupStyles from "./DataGridColumnFooterGroup.module.css";

import { DataGridInstance, HeaderGroup } from "../types";
import DataGridColumnFooterCell from "./DataGridColumnFooterCell";

export interface DataGridColumnHeaderGroupProps<TData extends RowData> {
  instance: DataGridInstance<TData>;
  group: HeaderGroup<TData>;
}

const DataGridColumnHeaderGroup = <TData extends RowData>({
  instance,
  group,
}: DataGridColumnHeaderGroupProps<TData>) => {
  return (
    <div
      className={clsx("DataGridColumnFooterGroup-root", gridFooterGroupStyles.root, instance.options.classNames?.columnFooterGroup?.root)}
      style={{
        ...instance.options.styles?.columnFooterGroup?.root,
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

export default DataGridColumnHeaderGroup;

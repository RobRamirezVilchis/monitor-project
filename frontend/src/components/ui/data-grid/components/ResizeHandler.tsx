import clsx from "clsx";

import styles from "./ResizeHandler.module.css";

import { DataGridInstance, Header } from "../types";

interface ResizeHandlerProps<TData extends unknown, TValue> {
  instance: DataGridInstance<TData>;
  header: Header<TData, TValue>;
}

const ResizeHandler = <TData extends unknown, TValue>({
  instance,
  header,
}: ResizeHandlerProps<TData, TValue>) => {
  return (
    <div
      className={clsx(styles.root)}
      onMouseDown={e => {
        e.stopPropagation();
        header.getResizeHandler()(e);
      }}
      onTouchStart={e => {
        e.stopPropagation();
        header.getResizeHandler()(e);
      }}
    >
    </div>
  )
}

export default ResizeHandler;

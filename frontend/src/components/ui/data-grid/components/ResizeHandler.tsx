import clsx from "clsx";

import resizeHandlerStyles from "./ResizeHandler.module.css";

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
      className={clsx(resizeHandlerStyles.root)}
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

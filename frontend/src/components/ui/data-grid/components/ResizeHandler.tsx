import { Header } from "@tanstack/react-table";

interface ResizeHandlerProps<TData extends unknown, TValue> {
  header: Header<TData, TValue>;
}

const ResizeHandler = <TData extends unknown, TValue>({
  header,
}: ResizeHandlerProps<TData, TValue>) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        background: "blue",
        width: 2,
        cursor: "col-resize",
        touchAction: "none",
      }}
      onMouseDown={header.getResizeHandler()}
      onTouchStart={header.getResizeHandler()}
    >
    </div>
  )
}

export default ResizeHandler;

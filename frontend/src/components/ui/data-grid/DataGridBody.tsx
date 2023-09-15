import { mergeRefs } from "@/hooks/utils/refs";
import { useScrollContext } from "./components/ScrollProvider";
import Scroll from "@/components/ui/data-grid/components/Scroll";

const DataGridBody = () => {
  const { xScroll, yScroll } = useScrollContext();

  return (
    <div className="grid flex-col border"
      style={{
        height: "100%",
        width: "100%",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gridTemplateRows: "1fr auto",
        overflow: "hidden",
        overflowAnchor: "none", // for virtualization
      }}
    >
      {/* Viewport */}
      <div
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          overflowAnchor: "none", // for virtualization
          touchAction: "pan-down",
        }}
      >
        {/* Content */}
        <div
          style={{
            width: "1500px",
            height: "10000px",
            border: "1px solid red",
            overflowAnchor: "none",
            overflow: "hidden",
          }}
          ref={mergeRefs(xScroll.contentRef, yScroll.contentRef)}
          onWheel={e => {
            xScroll.onWheel(e);
            yScroll.onWheel(e);
          }}
          onTouchStart={e => {
            xScroll.onTouchStart(e);
            yScroll.onTouchStart(e);
          }}
          onTouchMove={e => {
            xScroll.onTouchMove(e);
            yScroll.onTouchMove(e);
          }}
          onTouchEnd={e => {
            xScroll.onTouchEnd(e);
            yScroll.onTouchEnd(e);
          }}
        >
         Content
        </div>
      </div>
      <Scroll orientation="vertical" virtualSize={10000} ref={yScroll.scrollRef} onScroll={yScroll.onScroll} />
      <Scroll orientation="horizontal" virtualSize={1500} ref={xScroll.scrollRef} onScroll={xScroll.onScroll} />
    </div>
  );
}

export default DataGridBody;

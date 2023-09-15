import { useRef, useState } from "react";

import { mergeRefs } from "@/hooks/utils/refs";
import { useScrollContext } from "./components/ScrollProvider";
import Scroll from "@/components/ui/data-grid/components/Scroll";
import { useIsomorphicLayoutEffect } from "@/hooks/shared/useIsomorphicLayoutEffect";

const DataGridBody = () => {
  const { xScroll, yScroll } = useScrollContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const contentResizeObserverRef = useRef<ResizeObserver>();
  const [contentRect, setContentRect] = useState({ 
    width: 0, 
    height: 0,
  });
  
  useIsomorphicLayoutEffect(() => {
    if (!contentRef.current) return;
    contentResizeObserverRef.current = new ResizeObserver((entries, observer) => {
      const content = entries[0].target as HTMLDivElement;
      setContentRect({ 
        width: content.offsetWidth ?? 0, 
        height: content.offsetHeight ?? 0
      });
    });
    contentResizeObserverRef.current.observe(contentRef.current);

    return () => contentResizeObserverRef.current?.disconnect();
  }, []);


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
          touchAction: "pan-down", // for mobile browser refresh gesture
        }}
      >
        {/* Content */}
        <div
          style={{
            width: "1500px",
            height: "500px",
            border: "1px solid red",
            overflowAnchor: "none",
            overflow: "hidden",
          }}
          ref={mergeRefs(contentRef, xScroll.contentRef, yScroll.contentRef)}
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
      <Scroll orientation="vertical" virtualSize={contentRect.height} ref={yScroll.scrollRef} onScroll={yScroll.onScroll} />
      <Scroll orientation="horizontal" virtualSize={contentRect.width} ref={xScroll.scrollRef} onScroll={xScroll.onScroll} />
    </div>
  );
}

export default DataGridBody;

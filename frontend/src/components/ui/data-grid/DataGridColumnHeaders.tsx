import { useRef } from "react";
import { useScrollsContext } from "./ScrollsProvider";
import { useIsomorphicLayoutEffect } from "@/hooks/shared/useIsomorphicLayoutEffect";

const DataGridColumnHeaders = () => {
  const headersRef = useRef<HTMLDivElement>(null);
  const { xScroll } = useScrollsContext();

  useIsomorphicLayoutEffect(() => {
    xScroll.syncScroll(headersRef);

    return () => {
      xScroll.desyncScroll(headersRef);
    };
  }, []);

  // Wrapper
  return (
    <div className="grid flex-col border"
      style={{
        width: "100%",
        overflow: "hidden",
        overflowAnchor: "none", // for virtualization
      }}
    >
      {/* Viewport */}
      <div
        ref={headersRef}
        style={{
          // width: "100%",
          height: "100%",
          overflow: "hidden",
          overflowAnchor: "none", // for virtualization
          touchAction: "pan-down", // for mobile browser refresh gesture
          display: "flex",
        }}
      >
        {["Header1", "Header2", "Header3", "Header4", "Header5", "Header6", "Header7", "Header8", "Header9", "Header10", "Header11", "Header12", "Header13"]
          .map(h => (
          <div key={h}
            style={{
              width: "200px",
              padding: "2px 10px",
            }}
            onWheel={xScroll.onWheel}
            onTouchStart={xScroll.onTouchStart}
            onTouchMove={xScroll.onTouchMove}
            onTouchEnd={xScroll.onTouchEnd}
          >
            {h}
          </div>
        ))}
      </div>
    </div>
  )
}

export default DataGridColumnHeaders;
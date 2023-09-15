import { DetailedHTMLProps, HTMLAttributes, forwardRef, useRef, useState } from "react";
import { Property } from "csstype";

import { mergeRefs } from "@/hooks/utils/refs";
import { useIsomorphicLayoutEffect } from "@/hooks/shared/useIsomorphicLayoutEffect";

export type ScrollOrientation = "horizontal" | "vertical";

export interface ScrollProps 
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  /**
   * The orientation of the scroll area.
   * @default "vertical"
   */
  orientation: ScrollOrientation;
  /**
   * The size of the scroll.
   * If a `number` is provided, px units will be used.
   * @default "100%"
   */
  size?: string | number;
  /**
   * The size of the scroll content.
   * If a `number` is provided, px units will be used.
   * @default 0
   */
  virtualSize?: string | number;
  /**
   * The overflow type of the scroll area.
   * @default "auto"
   */
  overflow?: Property.OverflowX | Property.OverflowY;
  /**
   * The thickness of the scroll bar.
   * If a `number` is provided, px units will be used.
   * @default 15
   */
  thickness?: number;
  /**
   * Callback fired when the visibility of the scroll bar changes.
   * @param visible 
   */
  onVisibilityChange?: (visible: boolean) => void;
}

// TODO: Fix onVisibilityChange callback firing twice on changes

const Scroll = forwardRef<HTMLDivElement, ScrollProps>(({
  orientation = "vertical",
  size = "100%",
  virtualSize = 0,
  overflow = "auto",
  thickness = 15,
  onVisibilityChange,
  ...props
}, ref) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver>();
  const [hide, setHide] = useState(true);

  useIsomorphicLayoutEffect(() => {
    resizeObserverRef.current = new ResizeObserver((entries, observer) => {
      if (!contentRef.current || !viewportRef.current) return;

      const viewport = viewportRef.current;
      const content = contentRef.current;
      if (orientation === "vertical") {
        const viewportHeight = viewport.offsetHeight;
        const contentHeight = content.offsetHeight;
        const hide = viewportHeight >= contentHeight;
        setHide(prev => {
          if (hide !== prev) onVisibilityChange?.(hide);
          return hide;
        });
      }
      else {
        const viewportWidth = viewport.offsetWidth;
        const contentWidth = content.offsetWidth;
        const hide = viewportWidth >= contentWidth;
        setHide(prev => {
          if (hide !== prev) onVisibilityChange?.(hide);
          return hide;
        });
      }
    });
    resizeObserverRef.current.observe(viewportRef.current!);
    resizeObserverRef.current.observe(contentRef.current!);

    return () => resizeObserverRef.current?.disconnect();
  }, []);

  return (
    // Viewport
    <div
      {...props}
      ref={mergeRefs(ref, viewportRef)}
      style={{
        height: orientation === "vertical" ? size 
          : hide ? 0 : thickness,
        width: orientation === "horizontal" ? size 
          : hide ? 0 : thickness,
        overflowX: orientation === "horizontal" ? overflow : "hidden",
        overflowY: orientation === "vertical" ? overflow : "hidden",
      }}
    >
      {/* ScrollContent */}
      <div
        ref={contentRef}
        style={{
          height: orientation === "vertical" ? virtualSize : thickness,
          width: orientation === "horizontal" ? virtualSize : thickness,
          overflow: "hidden",
        }}
      ></div>
    </div>
  );
});
Scroll.displayName = "Scroll";

export default Scroll;

import { DetailedHTMLProps, FC, HTMLAttributes, forwardRef } from "react";
import { Property } from "csstype";

export interface ScrollProps 
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  /**
   * The orientation of the scroll area.
   * @default "vertical"
   */
  orientation: "horizontal" | "vertical";
  /**
   * The size of the scroll.
   * If a `number` is provided, px units will be used.
   * @default "100%"
   */
  size?: string | number;
  /**
   * The size of the scroll content.
   * If a `number` is provided, px units will be used.
   * @default "100%"
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
}

const Scroll = forwardRef<HTMLDivElement, ScrollProps>(({
  orientation = "vertical",
  size = "100%",
  virtualSize = "100%",
  overflow = "auto",
  thickness = 15,
  ...props
}, ref) => {

  return (
    // Viewport
    <div
      {...props}
      ref={ref}
      style={{
        height: orientation === "vertical" ? size : thickness,
        width: orientation === "horizontal" ? size : thickness,
        overflowX: orientation === "horizontal" ? overflow : "hidden",
        overflowY: orientation === "vertical" ? overflow : "hidden",
      }}
    >
      {/* ScrollContent */}
      <div
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

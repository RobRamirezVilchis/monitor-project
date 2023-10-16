import { PointerEventHandler, PointerEvent, RefObject, MutableRefObject, TouchEventHandler, UIEventHandler, WheelEventHandler, useCallback, useEffect, useMemo, useRef } from "react";

import { clamp, closeToZero, lerp2, mapValue, easeOutCubic } from "@/utils/math";
import { ScrollOrientation } from "./Scroll";

export interface UseScrollOptions {
  /**
   * The orientation of the scroll area.
   * @default "vertical"
   */
  orientation: ScrollOrientation;
  /**
   * The behavior of the wheel scrolling.
   * @default "smooth"
   */
  wheelBehavior?: "instant" | "smooth";
  lockOuterScrollOf?: RefObject<HTMLElement>;
}

export interface ScrollableElement {
  ref: RefObject<HTMLDivElement>;
  /**
   * The mode of the scroll.
   * @default "scroll"
   */
  mode: "scroll" | "translate";
}

// TODO: Add support for mouse wheel click scrolling
export interface ScrollContext {
  start: {
    scrollPosition: number;
    clientPosition: number;
    timestamp: number;
    velocity: number;
    acceleration: number;
    direction: number;
  };
  current: {
    scrollPosition: number;
    clientPosition: number;
    timestamp: number;
    velocity: number;
    acceleration: number;
    direction: number;
    delta: number;
  };
  elapsed: number;
  orientation: ScrollOrientation;
  initiator: "wheel" | "pointer" | "pointer-manual";
};

export const useScroll = ({
  orientation = "vertical",
  wheelBehavior = "smooth",
}: UseScrollOptions) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollableElementsRef = useRef<ScrollableElement[]>([]);

  const scrollContextRef = useRef<ScrollContext | null>(null);

  const syncScroll = useCallback((element: ScrollableElement) => {
    for (let current of scrollableElementsRef.current) {
      if (current.ref === element.ref) return;
    }
    scrollableElementsRef.current.push(element);
  }, []);

  const desyncScroll = useCallback((elementRef: RefObject<HTMLDivElement>) => {
    const found = scrollableElementsRef.current.findIndex(ref => ref.ref === elementRef);
    if (found !== -1)
      scrollableElementsRef.current.splice(found, 1);
  }, []);

  // Scrollbar Events ----------------------------------------------------------
  const onScroll = useCallback<UIEventHandler<HTMLDivElement>>((e) => {
    for (let element of scrollableElementsRef.current) {
      if (!element.ref.current) continue;

      if (element.mode === "scroll") {
        if (orientation === "vertical")
        element.ref.current.scrollTop = e.currentTarget.scrollTop;
        else
          element.ref.current.scrollLeft = e.currentTarget.scrollLeft;
      }
      else {
        const { x, y } = getTranslateXY(element.ref.current);
        element.ref.current.style.transform = orientation === "vertical"
          ? `translate(${x}px, -${e.currentTarget.scrollTop}px)`
          : `translate(-${e.currentTarget.scrollLeft}px, ${y}px)`;
      }
    }
  }, [orientation]);

  // Wheel Events --------------------------------------------------------------
  const onWheel = useCallback<WheelEventHandler<HTMLDivElement>>((e) => {
    if (!scrollRef.current) return;

    const shiftKey = e.shiftKey;
    const delta = shiftKey 
      ? (orientation === "vertical" ? e.deltaX : e.deltaY)
      : (orientation === "vertical" ? e.deltaY : e.deltaX);
    if (delta === 0) return;

    if (wheelBehavior === "instant") {
      const current = orientation === "vertical" 
        ? scrollRef.current.scrollTop 
        : scrollRef.current.scrollLeft;
      const next = current + delta;
      orientation === "vertical"
        ? scrollRef.current.scrollTop = next
        : scrollRef.current.scrollLeft = next;
    }
    else {
      const scrollPosition = orientation === "vertical"
        ? scrollRef.current.scrollTop
        : scrollRef.current.scrollLeft;
      const clientPosition = orientation === "vertical"
        ? e.clientY
        : e.clientX;
      
      const time = 200;
      const acceleration = (2 * delta) / (time ** 2);
      const velocity = acceleration * time;
      const direction = Math.sign(delta);
      if (!scrollContextRef.current || scrollContextRef.current.initiator !== "wheel") {
        requestAnimationFrame((timestamp) => {
          scrollContextRef.current = {
            start: {
              scrollPosition,
              clientPosition,
              timestamp,
              velocity,
              // We negate the acceleration since our final velocity is 0 and not the calculated one
              acceleration: -acceleration,
              direction,
            },
            current: {
              scrollPosition,
              clientPosition,
              timestamp,
              delta: 0,
              velocity,
              // We negate the acceleration since our final velocity is 0 and not the calculated one
              acceleration: -acceleration,
              direction,
            },
            elapsed: 0,
            orientation,
            initiator: "wheel",
          };
          requestAnimationFrame(timestamp => smoothScroll(scrollRef, scrollContextRef, "wheel", timestamp));
        });
      }
      else {
        scrollContextRef.current.current.delta = 0;
        scrollContextRef.current.current.direction = direction;
        scrollContextRef.current.current.velocity = direction === scrollContextRef.current.current.direction
          ? scrollContextRef.current.current.velocity + velocity / 2
          : velocity;
        scrollContextRef.current.current.acceleration = -scrollContextRef.current.current.velocity / time;
      }
    }
  }, [orientation, wheelBehavior]);

  // Pointer Events ------------------------------------------------------------
  const onPointerDown = useCallback<PointerEventHandler<HTMLDivElement>>((e) => {
    const initiatorButtons = [
      0, // Left click / touch
    ];
    const initiatorPointerTypes: PointerEvent<HTMLDivElement>["pointerType"][] = [
      "touch", 
      "pen",
    ];

    if (!scrollRef.current 
      || !initiatorButtons.includes(e.button) 
      || !initiatorPointerTypes.includes(e.pointerType)) 
      return;

    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const scrollPosition = orientation === "vertical"
      ? scrollRef.current.scrollTop
      : scrollRef.current.scrollLeft;
    const clientPosition = orientation === "vertical"
      ? e.clientY 
      : e.clientX;

    scrollContextRef.current = {
      start: {
        scrollPosition,
        clientPosition,
        timestamp: e.timeStamp,
        velocity: 0,
        acceleration: 0,
        direction: 0,
      },
      current: {
        scrollPosition,
        clientPosition,
        timestamp: e.timeStamp,
        velocity: 0,
        acceleration: 0,
        direction: 0,
        delta: 0,
      },
      elapsed: 0,
      orientation,
      initiator: "pointer-manual",
    };
  }, [orientation]);

  // TODO: Fix 
  const onPointerMove = useCallback<PointerEventHandler<HTMLDivElement>>((e) => {
    if (!scrollRef.current 
      || !(e.target as HTMLElement).hasPointerCapture(e.pointerId)
      || !scrollContextRef.current 
      || scrollContextRef.current.initiator !== "pointer-manual")
      return;

    const scrollPosition = orientation === "vertical"
      ? scrollRef.current.scrollTop
      : scrollRef.current.scrollLeft;
    const clientPosition = orientation === "vertical" 
      ? e.clientY 
      : e.clientX;
    const distance = clientPosition - scrollContextRef.current.current.clientPosition;
    
    if (distance === 0) return;

    const deltaTime = e.timeStamp - scrollContextRef.current.current.timestamp;
    scrollContextRef.current.current = {
      scrollPosition: scrollPosition - distance,
      clientPosition,
      timestamp: e.timeStamp,
      delta: distance,
      velocity: -distance / deltaTime,
      acceleration: 0,
      direction: -Math.sign(distance),
    };
    scrollContextRef.current.elapsed = scrollContextRef.current.current.timestamp - scrollContextRef.current.start.timestamp;

    if (orientation === "vertical")
      scrollRef.current.scrollTop -= distance;
    else 
      scrollRef.current.scrollLeft -= distance;
  }, [orientation]);
  
  const onPointerUp = useCallback<PointerEventHandler<HTMLDivElement>>((e) => {
    if ((e.target as HTMLElement).hasPointerCapture(e.pointerId))
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    if (!scrollRef.current 
      || !scrollContextRef.current 
      || scrollContextRef.current.initiator !== "pointer-manual") 
      return;

    const scrollPosition = orientation === "vertical"
      ? scrollRef.current.scrollTop
      : scrollRef.current.scrollLeft;
    const clientPosition = orientation === "vertical" 
      ? e.clientY 
      : e.clientX;

    if (scrollContextRef.current.current.velocity === 0) {
      scrollContextRef.current = null;
      return;
    }

    requestAnimationFrame((timestamp) => {
      if (!scrollContextRef.current) return;
      scrollContextRef.current.start.scrollPosition = scrollPosition;
      scrollContextRef.current.start.clientPosition = clientPosition;
      scrollContextRef.current.start.timestamp = timestamp;
      scrollContextRef.current.start.velocity = scrollContextRef.current.current.velocity;
      scrollContextRef.current.start.acceleration = 0.003 * Math.sign(-scrollContextRef.current.current.velocity);
      scrollContextRef.current.start.direction = scrollContextRef.current.current.direction;
      scrollContextRef.current.current.scrollPosition = scrollPosition;
      scrollContextRef.current.current.clientPosition = clientPosition;
      scrollContextRef.current.current.timestamp = timestamp;
      scrollContextRef.current.current.acceleration = 0.003 * Math.sign(-scrollContextRef.current.current.velocity);
      scrollContextRef.current.current.direction = scrollContextRef.current.current.direction;
      scrollContextRef.current.current.delta = 0;
      scrollContextRef.current.initiator = "pointer";

      requestAnimationFrame(timestamp => smoothScroll(scrollRef, scrollContextRef, "pointer", timestamp));
    })
  }, [orientation]);
  
  // Content Events ------------------------------------------------------------
  const value = useMemo(() => ({
    scrollRef,
    syncScroll,
    desyncScroll,
    onScroll,

    onWheel,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  }), [scrollRef, syncScroll, desyncScroll, onScroll, onWheel, onPointerDown, onPointerMove, onPointerUp]);
  return value;
}

export type UseScrollReturn = ReturnType<typeof useScroll>;

function getScrollLimits(element: HTMLElement, orientation: ScrollOrientation) {
  return {
    min: 0,
    max: orientation === "vertical" 
      ? element.scrollHeight! - element.clientHeight!
      : element.scrollWidth! - element.clientWidth!,
  };
}

function getTranslateXY(element: HTMLElement) {
  const style = window.getComputedStyle(element)
  const matrix = new DOMMatrixReadOnly(style.transform)
  return {
      x: matrix.m41,
      y: matrix.m42
  }
}

function smoothScroll(scrollRef: RefObject<HTMLDivElement>, scrollContextRef: MutableRefObject<ScrollContext | null>, initiator: ScrollContext["initiator"], timestamp: number) {
  if (!scrollRef.current || !scrollContextRef.current || scrollContextRef.current.initiator !== initiator) return;

  const { current, orientation } = scrollContextRef.current;
  const { acceleration, velocity, direction, scrollPosition: position, timestamp: prevTimestamp } = current;
  const deltaTime = timestamp - prevTimestamp;
  scrollContextRef.current.elapsed += deltaTime;
  const distance = velocity * deltaTime + 0.5 * acceleration * deltaTime ** 2;
  scrollContextRef.current.current.delta += distance;
  const newVelocity = velocity + acceleration * deltaTime;
  scrollContextRef.current.current.velocity = newVelocity;
  const next = position + distance;

  if (orientation === "vertical")
    scrollRef.current.scrollTop = next;
  else
    scrollRef.current.scrollLeft = next;

  scrollContextRef.current.current.scrollPosition = next;
  scrollContextRef.current.current.timestamp = timestamp;

  const { min, max } = getScrollLimits(scrollRef.current, orientation);
  if ((direction > 0 
    ? newVelocity > 0 
    : newVelocity < 0)
    && (next >= min && next <= max))
    requestAnimationFrame(timestamp => smoothScroll(scrollRef, scrollContextRef, initiator, timestamp));
  else
    scrollContextRef.current = null;
}

/*
  Formulas used:
  d = 1/2at^2
  a = 2d / t^2
  d = v0t + 1/2at^2 = (v0 + 1/2at)t
  v0 = d/t - 1/2at
  a = 2(d - v0t) / t^2
  v = v0 + at
  a = (v - v0) / t

  With a expected duration of 200ms, and a distance of 120px (1 scroll tick, varies between browsers)
  a = 2d/t^2 = 2 * 120 / 200^2 = .006 px/s^2
  v = v0 + at = 0 + .006 * 200 = 1.2 px/ms
*/
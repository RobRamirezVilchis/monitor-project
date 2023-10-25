import { 
  PointerEventHandler, 
  PointerEvent, 
  RefObject, 
  MutableRefObject, 
  UIEventHandler, 
  WheelEventHandler, 
  useCallback, 
  useEffect, 
  useMemo, 
  useRef 
} from "react";

import { ScrollOrientation } from "./Scroll";
import type { RequiredKeys } from "@/utils/types";

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
  initiator: "wheel" | "pointer" | "pointer-manual";
  clientPosition: number;
  timestamp: number;
  velocity: number;
  acceleration: number;
  direction: number;
  events: number;
  elapsed: number;
  orientation: ScrollOrientation;
};

/**
 * Syncs viewport of scrollable content with scrollbars even when 
 * their overflow properties are set to hidden.
 * NOTE: In other for the outer scrollbars (in case the this hook is used
 * in a component inside another scrollable element) to update properly 
 * in mobile browsers, the most outer scrollable element that may overflow should
 * define its overflow/x/y properties as "auto" or "scroll". This must be set to 
 * both the body and html tags or to a wrapper element inside the body tag.
 * This is not needed for desktop browsers.
 */
export const useScroll = ({
  orientation = "vertical",
  wheelBehavior = "smooth",
}: UseScrollOptions) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollableElementsRef = useRef<ScrollableElement[]>([]);
  const scrollRootContainerRef = useRef<HTMLDivElement>(null);

  const scrollContextRef = useRef<ScrollContext | null>(null);

  const scrollLockContextRef = useRef<{
    unregister: () => void;
    counter: number;
  } | null>(null);
  const closestScrollableElementRef = useRef<HTMLElement | null>(null);

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

  // Wheel Locking -------------------------------------------------------------
  const shouldLockScroll = useCallback((shouldLock: boolean) => {
    if (shouldLock === !!scrollLockContextRef.current) return;

    if (scrollLockContextRef.current) {
      scrollLockContextRef.current.unregister();
      scrollLockContextRef.current = null;
    }

    if (shouldLock) {
      const lockWheel = (e: WheelEvent) => {
        if (!scrollRef.current || !scrollLockContextRef.current) return;
    
        const { min, max } = getScrollLimits(scrollRef.current, orientation);
        const shiftKey = e.shiftKey;
        const current = shiftKey
          ? (orientation === "vertical" ? scrollRef.current.scrollLeft : scrollRef.current.scrollTop)
          : (orientation === "vertical" ? scrollRef.current.scrollTop : scrollRef.current.scrollLeft);
        const dir = shiftKey
          ? (orientation === "vertical" ? e.deltaX : e.deltaY)
          : (orientation === "vertical" ? e.deltaY : e.deltaX);

        if (dir === 0) return; // Only prevent if the user is scrolling in the same direction as the scroll

        if ((dir > 0 && current === max) || (dir < 0 && current === min))
          scrollLockContextRef.current.counter += 1;
        else 
          scrollLockContextRef.current.counter = 0;
    
        if (scrollLockContextRef.current.counter < 2) {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      window.addEventListener("wheel", lockWheel, { passive: false });

      scrollLockContextRef.current = {
        counter: 0,
        unregister: () => {
          window.removeEventListener("wheel", lockWheel);
        },
      };
    }
  }, [orientation]);

  useEffect(() => {
    if (scrollLockContextRef.current) {
      scrollLockContextRef.current.unregister();
      scrollLockContextRef.current = null;
    }
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
      const time = 200;
      const acceleration = (2 * delta) / (time ** 2);
      const velocity = acceleration * time;
      const direction = Math.sign(delta);
      if (!scrollContextRef.current || scrollContextRef.current.initiator !== "wheel") {
        requestAnimationFrame((timestamp) => {
          scrollContextRef.current = createScrollContext({
            initiator: "wheel", 
            orientation, 
            timestamp,
            velocity,
            acceleration: -acceleration,
            direction,
          });
          requestAnimationFrame(timestamp => smoothScroll(scrollRef.current, scrollContextRef, "wheel", timestamp));
        });
      }
      else {
        scrollContextRef.current.direction = direction;
        scrollContextRef.current.velocity = direction === scrollContextRef.current.direction
          ? scrollContextRef.current.velocity + velocity / 2
          : velocity;
        scrollContextRef.current.acceleration = -scrollContextRef.current.velocity / time;
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

    const clientPosition = orientation === "vertical"
      ? e.clientY 
      : e.clientX;

    scrollContextRef.current = createScrollContext({
      initiator: "pointer-manual", 
      orientation,
      clientPosition,
      timestamp: e.timeStamp,
    });
  }, [orientation]);

  const onPointerMove = useCallback<PointerEventHandler<HTMLDivElement>>((e) => {
    if (!scrollRef.current 
      || !(e.target as HTMLElement).hasPointerCapture(e.pointerId)
      || !scrollContextRef.current 
      || scrollContextRef.current.initiator !== "pointer-manual")
      return;
    
    const clientPosition = orientation === "vertical" 
      ? e.clientY 
      : e.clientX;
    const delta = clientPosition - scrollContextRef.current.clientPosition;
    
    if (delta === 0) return;

    const deltaTime = e.timeStamp - scrollContextRef.current.timestamp;
    scrollContextRef.current = {
      ...scrollContextRef.current,
      clientPosition,
      timestamp: e.timeStamp,
      velocity: -delta / deltaTime,
      direction: -Math.sign(delta),
    };
    scrollContextRef.current.events += 1;
    
    if (scrollContextRef.current.events === 1) {
      // On the first move event, check if the scroll is at the limit
      // If it is, find the next scrollable element and scroll it instead
      const scrollPosition = orientation === "vertical"
        ? scrollRef.current.scrollTop
        : scrollRef.current.scrollLeft;
      const { min, max } = getScrollLimits(scrollRef.current, orientation);
      // if (((delta < 0 && scrollPosition === max) || (delta > 0 && scrollPosition === min)) && !closestScrollableElementRef.current && scrollRootContainerRef.current)
      if (((delta < 0 && Math.abs(scrollPosition - max) < 1) || (delta > 0 && Math.abs(scrollPosition - min) < 1)) && !closestScrollableElementRef.current && scrollRootContainerRef.current)
        closestScrollableElementRef.current = findNextScrollableElement(scrollRootContainerRef.current.parentElement, orientation);
    }

    if (closestScrollableElementRef.current) {
      if (orientation === "vertical")
        closestScrollableElementRef.current.scrollTop -= delta;
      else
        closestScrollableElementRef.current.scrollLeft -= delta;
      return;
    }
    else {
      if (orientation === "vertical")
        scrollRef.current.scrollTop -= delta;
      else
        scrollRef.current.scrollLeft -= delta;
    }
  }, [orientation]);
  
  const onPointerUp = useCallback<PointerEventHandler<HTMLDivElement>>((e) => {
    if ((e.target as HTMLElement).hasPointerCapture(e.pointerId))
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    if (!scrollRef.current 
      || !scrollContextRef.current 
      || scrollContextRef.current.initiator !== "pointer-manual") 
      return;

    if (scrollContextRef.current.velocity === 0) {
      scrollContextRef.current = null;
      return;
    }
    
    const clientPosition = orientation === "vertical" 
      ? e.clientY 
      : e.clientX;

    requestAnimationFrame((timestamp) => {
      if (!scrollContextRef.current) return;

      const accelerationFactor = 0.003;
      scrollContextRef.current = {
        ...scrollContextRef.current,
        clientPosition: clientPosition,
        timestamp: timestamp,
        acceleration: accelerationFactor * Math.sign(-scrollContextRef.current.velocity),
        direction: scrollContextRef.current.direction,
        initiator: "pointer",
      }

      requestAnimationFrame(timestamp => {
        let targetEl: HTMLElement | null = scrollRef.current;
        if (closestScrollableElementRef.current) {
          targetEl = closestScrollableElementRef.current;
          closestScrollableElementRef.current = null;
        }
        smoothScroll(targetEl, scrollContextRef, "pointer", timestamp);
      });
    })
  }, [orientation]);
  
  // Content Events ------------------------------------------------------------
  const value = useMemo(() => ({
    scrollRef,
    scrollRootContainerRef,

    syncScroll,
    desyncScroll,
    shouldLockScroll,

    onScroll,

    onWheel,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  }), [scrollRef, syncScroll, desyncScroll, shouldLockScroll, onScroll, onWheel, onPointerDown, onPointerMove, onPointerUp]);
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

function isScrollableElement(element: HTMLElement, orientation: ScrollOrientation) {
  const isOverflowing = orientation === "vertical"
    ? element.scrollHeight > element.clientHeight
    : element.scrollWidth > element.clientWidth;

  if (element === document.documentElement && isOverflowing) 
    return true;

  const computedStyle = getComputedStyle(element);

  const isOverflowScrollable = orientation === "vertical"
    ? computedStyle.overflowY === "auto" || computedStyle.overflowY === "scroll"
    : computedStyle.overflowX === "auto" || computedStyle.overflowX === "scroll";

  return isOverflowing && isOverflowScrollable;
}

function findNextScrollableElement(current: HTMLElement | null, orientation: ScrollOrientation): HTMLElement | null {
  if (!current) return null;
  if (isScrollableElement(current, orientation)) return current;
  return findNextScrollableElement(current.parentElement, orientation);
}

function smoothScroll(scrollEl: HTMLElement | null, scrollContextRef: MutableRefObject<ScrollContext | null>, initiator: ScrollContext["initiator"], timestamp: number) {
  if (!scrollEl || !scrollContextRef.current || scrollContextRef.current.initiator !== initiator) return;

  const { orientation, acceleration, velocity, direction, timestamp: prevTimestamp } = scrollContextRef.current;
  const position = orientation === "vertical" ? scrollEl.scrollTop : scrollEl.scrollLeft;
  const deltaTime = timestamp - prevTimestamp;
  scrollContextRef.current.elapsed += deltaTime;
  const distance = velocity * deltaTime + 0.5 * acceleration * deltaTime ** 2;
  const newVelocity = velocity + acceleration * deltaTime;
  scrollContextRef.current.velocity = newVelocity;
  const next = position + distance;

  if (orientation === "vertical")
    scrollEl.scrollTop = next;
  else
    scrollEl.scrollLeft = next;

  scrollContextRef.current.timestamp = timestamp;

  const { min, max } = getScrollLimits(scrollEl, orientation);
  if ((direction > 0 
    ? newVelocity > 0 
    : newVelocity < 0)
    && (next >= min && next <= max))
    requestAnimationFrame(timestamp => smoothScroll(scrollEl, scrollContextRef, initiator, timestamp));
  else
    scrollContextRef.current = null;
}

function createScrollContext({
  initiator,
  orientation,
  timestamp, 
  clientPosition = 0,
  velocity = 0,
  acceleration = 0,
  direction = 0,
  events = 0,
  elapsed = 0,
}: RequiredKeys<Partial<ScrollContext>, "initiator" | "orientation" | "timestamp">): ScrollContext {
  return {
    initiator,
    orientation,
    timestamp,
    clientPosition,
    velocity,
    acceleration,
    direction,
    events,
    elapsed,
  }
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
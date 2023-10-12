import { RefObject, TouchEventHandler, UIEventHandler, WheelEventHandler, useCallback, useEffect, useMemo, useRef } from "react";

import { clamp, closeToZero, lerp2, mapValue, easeOutCubic } from "@/utils/math";
import { ScrollOrientation } from "./Scroll";

export interface UseScrollOptions {
  /**
   * The orientation of the scroll area.
   * @default "vertical"
   */
  orientation: ScrollOrientation;
  lockOuterScrollOf?: RefObject<HTMLElement>;
}

// TODO: Add support for mouse wheel click scrolling

export const useScroll = ({
  orientation = "vertical",
}: UseScrollOptions) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRefs = useRef<RefObject<HTMLDivElement>[]>([]);
  const wheelLockedRef = useRef(false);
  const touchMoveLockedRef = useRef(false);

  const scrollInfo = useRef({
    start: 0,
    end: 0,
    prevTimestamp: 0,
    elapsed: 0,
    delta: 0,
    orientation: "vertical",
  });

  const touchInfo = useRef({
    start: 0,
    startTimestamp: 0,
    end: 0,
  });

  const lockWheel = useCallback<WheelEventHandler<HTMLDivElement>>((e) => {
    if (!scrollRef.current) return;

    const { min, max } = getScrollLimits(scrollRef.current, orientation);
    const current = orientation === "vertical" ? scrollRef.current!.scrollTop : scrollRef.current.scrollLeft;
    const dir = orientation === "vertical" ? e.deltaY : e.deltaX;
    let prevent = dir !== 0; // Only prevent if the user is scrolling in the same direction as the scroll
    if (dir > 0 && current === max || dir < 0 && current === min)
      prevent = false;

    if (prevent) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, [orientation]);

  // TODO: Fix this
  const lockTouchMove = useCallback<TouchEventHandler<HTMLDivElement>>((e) => {
    if (!scrollRef.current) return;

    const { min, max } = getScrollLimits(scrollRef.current, orientation);
    const current = orientation === "vertical" ? scrollRef.current!.scrollTop : scrollRef.current.scrollLeft;
    const dir = (orientation === "vertical" 
      ? e.touches[0].clientY 
      : e.touches[0].clientX
    ) - touchInfo.current.start;
    let prevent = dir !== 0; // Only prevent if the user is scrolling in the same direction as the scroll
      
    if (dir < 0 && current === max || dir > 0 && current === min)
    prevent = false;

    if (prevent) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, [orientation]);

  useEffect(() => {
    if (wheelLockedRef.current)
      window.addEventListener("wheel", lockWheel as any);

    return () => {
      window.removeEventListener("wheel", lockWheel as any);
    }
  }, [lockWheel]);

  useEffect(() => {
    if (touchMoveLockedRef.current)
      window.addEventListener("touchmove", lockTouchMove as any);

    return () => {
      window.removeEventListener("touchmove", lockTouchMove as any);
    }
  }, [lockTouchMove]);

  const syncScroll = useCallback((element: RefObject<HTMLDivElement>) => {
    if (!contentRefs.current.includes(element))
      contentRefs.current.push(element);
  }, []);

  const desyncScroll = useCallback((element: RefObject<HTMLDivElement>) => {
    const found = contentRefs.current.findIndex(ref => ref === element);
    if (found !== -1)
      contentRefs.current.splice(found, 1);
  }, []);

  const lockOuterScroll = useCallback(() => {
    if (!wheelLockedRef.current) {
      window.addEventListener("wheel", lockWheel as any, { passive: false });
      wheelLockedRef.current = true;
    }

    if (!touchMoveLockedRef.current) {
      window.addEventListener("touchmove", lockTouchMove as any, { passive: false });
      touchMoveLockedRef.current = true;
    }
  }, [lockWheel, lockTouchMove]);

  const unlockOuterScroll = useCallback(() => {
    if (wheelLockedRef.current) {
      window.removeEventListener("wheel", lockWheel as any);
      wheelLockedRef.current = false;
    }

    if (touchMoveLockedRef.current) {
      window.removeEventListener("touchmove", lockTouchMove as any);
      touchMoveLockedRef.current = false;
    }
  }, [lockWheel, lockTouchMove]);

  // Scrollbar Events ----------------------------------------------------------
  const onScroll = useCallback<UIEventHandler<HTMLDivElement>>((e) => {
    if (contentRefs.current.length === 0) return;
    
    for (let element of contentRefs.current) {
      if (!element.current) continue;

      if (orientation === "vertical")
        element.current.scrollTop = e.currentTarget.scrollTop;
      else
        element.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  }, [orientation]);
  
  // Content Events ------------------------------------------------------------
  const animateSmoothScroll = useCallback((timestamp: number, orientation: ScrollOrientation, duration: number = 200, easeFn: (x: number) => number = (x) => x) => {
    if (!scrollRef.current) return;

    const current = orientation === "vertical" ? scrollRef.current!.scrollTop : scrollRef.current!.scrollLeft;
    if (scrollInfo.current.end === current) return;

    const deltaTime = timestamp - scrollInfo.current.prevTimestamp;
    scrollInfo.current.elapsed += deltaTime;
    const { start, end, elapsed } = scrollInfo.current;
    const { min, max } = getScrollLimits(scrollRef.current, orientation);
    const t = easeFn(clamp(mapValue(elapsed, 0, duration, 0, 1), 0, 1));
    const interpolated = lerp2(start, end, t);

    if (orientation === "vertical") scrollRef.current!.scrollTop = clamp(interpolated, min, max);
    else                            scrollRef.current!.scrollLeft = clamp(interpolated, min, max);

    scrollInfo.current.prevTimestamp = timestamp;
    if (t < 1) requestAnimationFrame(timestamp => animateSmoothScroll(timestamp, orientation, duration, easeFn));
  }, []);

  const initAnimateScroll = useCallback((timestamp: number, delta: number, orientation: ScrollOrientation, duration: number = 200, easeFn: (x: number) => number = (x) => x) => {
    if (!scrollRef.current) return;

    const start = orientation === "vertical" ? scrollRef.current!.scrollTop : scrollRef.current!.scrollLeft;
    const t = clamp(mapValue(scrollInfo.current.elapsed, 0, 150, 0, 1), 0, 1);
    const diff = closeToZero(1 - t) 
      ? 0 
      : scrollInfo.current.end - start;
    const { min, max } = getScrollLimits(scrollRef.current, orientation);
    const end = start + delta + diff;

    scrollInfo.current = {
      start: Math.min(start, max),
      end: Math.max(end, min),
      prevTimestamp: timestamp,
      elapsed: 0,
      delta,
      orientation,
    };

    requestAnimationFrame(timestamp => animateSmoothScroll(timestamp, orientation, duration, easeFn));
  }, [animateSmoothScroll]);

  const onWheel = useCallback<WheelEventHandler<HTMLDivElement>>((e) => {
    if (!scrollRef.current) return;

    const shiftKey = e.shiftKey;
    const delta = shiftKey 
      ? (orientation === "vertical" ? e.deltaX : e.deltaY)
      : (orientation === "vertical" ? e.deltaY : e.deltaX);
    if (delta === 0) return;
    requestAnimationFrame(timestamp => initAnimateScroll(timestamp, delta, orientation, 150));
  }, [orientation, initAnimateScroll]);

  const onTouchStart = useCallback<TouchEventHandler<HTMLDivElement>>((e) => {
    if (!scrollRef.current) return;

    touchInfo.current = {
      start: orientation === "vertical" ? e.touches[0].clientY : e.touches[0].clientX,
      end: orientation === "vertical" ? scrollRef.current.scrollTop : scrollRef.current.scrollLeft,
      startTimestamp: e.timeStamp,
    };

    if (!wheelLockedRef.current) {
      window.addEventListener("touchmove", lockTouchMove as any);
      touchMoveLockedRef.current = true;
    }
  }, [orientation, lockTouchMove]);

  const onTouchMove = useCallback<TouchEventHandler<HTMLDivElement>>((e) => {
    if (!scrollRef.current) return;

    const delta = (orientation === "vertical" 
      ? e.touches[0].clientY 
      : e.touches[0].clientX
    ) - touchInfo.current.start;
    // if (delta === 0) return;
    if (Math.abs(delta) < 5) return;
    const { min, max } = getScrollLimits(scrollRef.current, orientation);
    if (orientation === "vertical")
      scrollRef.current.scrollTop = clamp(
        touchInfo.current.end - delta,
        min,
        max
      );
    else 
      scrollRef.current.scrollLeft = clamp(
        touchInfo.current.end - delta,
        min,
        max
      );
  }, [orientation]);

  const onTouchEnd = useCallback<TouchEventHandler<HTMLDivElement>>((e) => {
    const distance = touchInfo.current.start -(orientation === "vertical"
      ? e.changedTouches[0].clientY
      : e.changedTouches[0].clientX
    );
    const time = e.timeStamp - touchInfo.current.startTimestamp;
    const velocity = distance / time;
    const delta = velocity * 500;
    requestAnimationFrame(timestamp => initAnimateScroll(timestamp, delta, orientation, 1000, easeOutCubic));

    if (wheelLockedRef.current) {
      window.removeEventListener("touchmove", lockTouchMove as any);
      touchMoveLockedRef.current = false;
    }
  }, [orientation, initAnimateScroll, lockTouchMove]);

  const value = useMemo(() => ({
    scrollRef,
    onScroll,
    onWheel,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    syncScroll,
    desyncScroll,
    lockOuterScroll,
    unlockOuterScroll,
  }), [onScroll, onWheel, onTouchStart, onTouchMove, onTouchEnd, syncScroll, desyncScroll, lockOuterScroll, unlockOuterScroll]);
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

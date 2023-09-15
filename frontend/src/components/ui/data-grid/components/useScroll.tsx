import { RefObject, TouchEventHandler, UIEventHandler, WheelEventHandler, useCallback, useMemo, useRef } from "react";

import { clamp, closeToZero, lerp2, mapValue, easeOutCubic } from "@/utils/math";
import { ScrollOrientation } from "./Scroll";

export interface UseScrollOptions {
  /**
   * The orientation of the scroll area.
   * @default "vertical"
   */
  orientation: ScrollOrientation;
}

export const useScroll = ({
  orientation = "vertical",
}: UseScrollOptions) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRefs = useRef<RefObject<HTMLDivElement>[]>([]);

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

  const syncTranslation = useCallback((element: RefObject<HTMLDivElement>) => {
    if (!contentRefs.current.includes(element))
      contentRefs.current.push(element);
  }, []);

  const desyncTanslation = useCallback((element: RefObject<HTMLDivElement>) => {
    const found = contentRefs.current.findIndex(ref => ref === element);
    if (found !== -1)
      contentRefs.current.splice(found, 1);
  }, []);

  // Scrollbar Events ----------------------------------------------------------
  const onScroll = useCallback<UIEventHandler<HTMLDivElement>>((e) => {
    if (contentRefs.current.length === 0) return;

    for (let element of contentRefs.current) {
      if (!element.current) continue;
      const { x, y } = getTranslateXY(element.current);
      element.current.style.transform = orientation === "vertical"
        ? `translate(${x}px, -${e.currentTarget.scrollTop}px)`
        : `translate(-${e.currentTarget.scrollLeft}px, ${y}px)`;
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
  }, [orientation]);

  const onTouchMove = useCallback<TouchEventHandler<HTMLDivElement>>((e) => {
    if (!scrollRef.current) return;

    const delta = (orientation === "vertical" 
      ? e.touches[0].clientY 
      : e.touches[0].clientX
    ) - touchInfo.current.start;
    if (delta === 0) return;
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
  }, [orientation, initAnimateScroll]);

  const value = useMemo(() => ({
    scrollRef,
    onScroll,
    onWheel,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    syncScroll: syncTranslation,
    desyncScroll: desyncTanslation,
  }), [onScroll, onWheel, onTouchStart, onTouchMove, onTouchEnd, syncTranslation, desyncTanslation]);
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

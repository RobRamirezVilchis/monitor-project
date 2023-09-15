
export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function lerp(start: number, end: number, t: number) {
  return start + t * (end - start);
}

export function lerp2(start: number, end: number, t: number) {
  return (1 - t) * start + t * end;
}

export function mapValue(value: number, x1: number, y1: number, x2: number, y2: number) {
  return ((value - x1) * (y2 - x2)) / (y1 - x1) + x2;
}

export function closeToZero(n: number, epsilon = 0.0001) {
  return Math.abs(n) < epsilon;
}

export function easeOutCubic(x: number) {
  return 1 - Math.pow(1 - x, 3);
}

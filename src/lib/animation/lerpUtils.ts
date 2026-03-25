import { clamp } from "@/utils/clamp";

export function lerp(start: number, end: number, alpha: number): number {
  return start + (end - start) * alpha;
}

export function damp(
  current: number,
  target: number,
  lambda: number,
  deltaTime: number,
): number {
  const t = 1 - Math.exp(-lambda * deltaTime);
  return lerp(current, target, clamp(t, 0, 1));
}

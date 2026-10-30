import { Point } from '../types/canvas';

/**
 * Applies exponential smoothing to a new point based on the previous point
 * @param current New point
 * @param previous Previous point
 * @param factor Smoothing weight (0: raw, 0.75: strong smoothing)
 */
export function smoothPoint(current: Point, previous: Point | null, factor: number = 0.5): Point {
  if (!previous) return current;

  // Adaptive smoothing: if distance is very large (fast swipe), decrease smoothing so it doesn't lag
  const dx = current.x - previous.x;
  const dy = current.y - previous.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // If moved > 80px in one frame, reduce factor so it keeps up
  const adaptiveFactor = dist > 80 ? Math.max(0.1, factor * 0.4) : factor;

  return {
    x: previous.x * adaptiveFactor + current.x * (1 - adaptiveFactor),
    y: previous.y * adaptiveFactor + current.y * (1 - adaptiveFactor),
    pressure: current.pressure ?? 1,
    time: current.time ?? Date.now(),
  };
}

/**
 * Draws a smooth stroke through an array of points using Quadratic Bézier curves
 */
export function renderSmoothPath(ctx: CanvasRenderingContext2D, points: Point[]): void {
  if (points.length < 2) return;

  if (points.length === 2) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.stroke();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
  }

  // Draw last segment
  const last = points[points.length - 1];
  const secondLast = points[points.length - 2];
  ctx.quadraticCurveTo(secondLast.x, secondLast.y, last.x, last.y);
  ctx.stroke();
}

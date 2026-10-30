import { Point, ShapeType } from '../types/canvas';

export interface ShapeDetectionResult {
  shape: ShapeType;
  confidence: number;
  points: Point[]; // Clean geometric points representing the identified shape
}

/**
 * Calculates distance between 2 points
 */
function dist(p1: Point, p2: Point): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Analyzes a completed stroke and determines if it closely matches a geometric shape
 */
export function detectShape(points: Point[]): ShapeDetectionResult {
  if (points.length < 8) {
    return { shape: 'none', confidence: 0, points: [] };
  }

  const start = points[0];
  const end = points[points.length - 1];
  const startEndDist = dist(start, end);

  // Total path length along stroke
  let totalLength = 0;
  for (let i = 1; i < points.length; i++) {
    totalLength += dist(points[i - 1], points[i]);
  }

  if (totalLength < 20) {
    return { shape: 'none', confidence: 0, points: [] };
  }

  // 1. Line detection: if the direct distance between start and end is close to total length
  const lineRatio = startEndDist / totalLength;
  if (lineRatio > 0.88) {
    return {
      shape: 'line',
      confidence: lineRatio,
      points: [start, end],
    };
  }

  // Calculate bounding box and centroid
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let sumX = 0, sumY = 0;

  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
    sumX += p.x;
    sumY += p.y;
  }

  const width = maxX - minX;
  const height = maxY - minY;
  const cx = sumX / points.length;
  const cy = sumY / points.length;

  if (width < 25 || height < 25) {
    return { shape: 'none', confidence: 0, points: [] };
  }

  const isClosed = startEndDist < Math.max(width, height) * 0.35;

  // 2. Circle detection:
  if (isClosed) {
    // Check variation in distance from centroid
    const radii: number[] = points.map(p => dist(p, { x: cx, y: cy }));
    const avgRadius = radii.reduce((a, b) => a + b, 0) / radii.length;
    const variance = radii.reduce((sum, r) => sum + Math.pow(r - avgRadius, 2), 0) / radii.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / avgRadius; // Coefficient of variation

    // Aspect ratio of bounding box
    const aspect = Math.min(width, height) / Math.max(width, height);

    if (cv < 0.22 && aspect > 0.7) {
      // Generate smooth circle points (36 segments)
      const circlePoints: Point[] = [];
      const segments = 48;
      const radius = (width + height) / 4;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        circlePoints.push({
          x: cx + radius * Math.cos(theta),
          y: cy + radius * Math.sin(theta),
        });
      }
      return {
        shape: 'circle',
        confidence: Math.max(0.7, 1 - cv),
        points: circlePoints,
      };
    }

    // 3. Rectangle detection:
    // If perimeter of bounding box roughly matches stroke length and points stay near box edges
    const bboxPerimeter = 2 * (width + height);
    const perimeterRatio = totalLength / bboxPerimeter;

    if (perimeterRatio > 0.8 && perimeterRatio < 1.35) {
      // Check corner density or if it's rectangular
      const rectPoints: Point[] = [
        { x: minX, y: minY },
        { x: maxX, y: minY },
        { x: maxX, y: maxY },
        { x: minX, y: maxY },
        { x: minX, y: minY },
      ];
      return {
        shape: 'rectangle',
        confidence: 0.82,
        points: rectPoints,
      };
    }

    // 4. Triangle detection:
    // Closed shape with 3 dominant directional changes
    const trianglePoints: Point[] = [
      { x: cx, y: minY },
      { x: maxX, y: maxY },
      { x: minX, y: maxY },
      { x: cx, y: minY },
    ];
    // If aspect and perimeter match
    if (perimeterRatio > 0.65 && perimeterRatio < 1.25) {
      return {
        shape: 'triangle',
        confidence: 0.75,
        points: trianglePoints,
      };
    }
  }

  return { shape: 'none', confidence: 0, points: [] };
}

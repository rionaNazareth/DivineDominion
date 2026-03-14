// =============================================================================
// DIVINE DOMINION — Map Renderer Pure Helpers (no Phaser dependency)
// =============================================================================

/** Maps development level (1–12) to city icon level (1–5). */
export function devToCityLevel(dev: number): 1 | 2 | 3 | 4 | 5 {
  if (dev <= 2)  return 1;
  if (dev <= 4)  return 2;
  if (dev <= 7)  return 3;
  if (dev <= 10) return 4;
  return 5;
}

/** Centroid of a polygon (avg of vertices). */
export function computeCentroid(vertices: { x: number; y: number }[]): { x: number; y: number } {
  if (vertices.length === 0) return { x: 0, y: 0 };
  const sum = vertices.reduce((acc, v) => ({ x: acc.x + v.x, y: acc.y + v.y }), { x: 0, y: 0 });
  return { x: sum.x / vertices.length, y: sum.y / vertices.length };
}

/** Estimate region width as the average max-dimension of bounding box. */
export function estimateRegionWidth(vertices: { x: number; y: number }[]): number {
  if (vertices.length === 0) return 50;
  const xs = vertices.map(v => v.x);
  const ys = vertices.map(v => v.y);
  const w = Math.max(...xs) - Math.min(...xs);
  const h = Math.max(...ys) - Math.min(...ys);
  return (w + h) / 2;
}

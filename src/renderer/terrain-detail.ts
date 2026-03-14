// =============================================================================
// DIVINE DOMINION — Terrain Micro-Detail Renderer
// Generates per-terrain decorations baked into static textures at world gen.
// All detail is CODE-RENDERED (art-spec.md §3c, §11e).
// Exported as pure data-generation functions for testability.
// =============================================================================

import type { TerrainType } from '../types/game.js';
import type { Vec2 } from '../types/game.js';

export interface MicroDetailItem {
  type: 'circle' | 'triangle' | 'arc' | 'rect' | 'wave' | 'ellipse';
  x: number;
  y: number;
  params: Record<string, number>;
  color: string;
  opacity: number;
}

/** Seeded LCG for deterministic micro-detail generation (not for simulation — display only). */
function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

/**
 * Generate micro-detail decorations for a region polygon, baked once at world-gen.
 * Returns items relative to the region centroid (0,0).
 */
export function generateMicroDetail(
  terrain: TerrainType,
  centroid: Vec2,
  seed: number,
  regionWidth: number,
): MicroDetailItem[] {
  const rng = lcg(seed);
  const items: MicroDetailItem[] = [];
  const half = regionWidth * 0.4;

  const rp = () => (rng() - 0.5) * 2 * half;  // random position in region
  const rr = (min: number, max: number) => min + rng() * (max - min);

  switch (terrain) {
    case 'forest': {
      const count = Math.floor(rr(4, 8));
      for (let i = 0; i < count; i++) {
        items.push({ type: 'circle', x: rp(), y: rp(), params: { r: rr(5, 7) }, color: '#1a3a1a', opacity: rr(0.4, 0.7) });
      }
      break;
    }
    case 'desert': {
      const waveCount = Math.floor(rr(3, 6));
      for (let i = 0; i < waveCount; i++) {
        items.push({ type: 'wave', x: rp(), y: rp(), params: { amplitude: rr(3, 6), width: rr(20, 40) }, color: '#6a5530', opacity: rr(0.25, 0.35) });
      }
      const rockCount = Math.floor(rr(2, 4));
      for (let i = 0; i < rockCount; i++) {
        items.push({ type: 'circle', x: rp(), y: rp(), params: { r: rr(2, 4) }, color: '#8a7040', opacity: rr(0.20, 0.30) });
      }
      break;
    }
    case 'mountain': {
      const peakCount = Math.floor(rr(2, 4));
      for (let i = 0; i < peakCount; i++) {
        const x = rp();
        const y = rp();
        const h = rr(12, 20);
        const w = rr(8, 14);
        items.push({ type: 'triangle', x, y, params: { width: w, height: h }, color: '#4a5868', opacity: 0.8 });
        items.push({ type: 'triangle', x, y: y - h * 0.6, params: { width: w * 0.5, height: h * 0.4 }, color: '#d0d8e0', opacity: 0.7 });
      }
      break;
    }
    case 'tundra': {
      const patchCount = Math.floor(rr(3, 7));
      for (let i = 0; i < patchCount; i++) {
        items.push({ type: 'circle', x: rp(), y: rp(), params: { r: rr(6, 12) }, color: '#a0b8c8', opacity: rr(0.07, 0.12) });
      }
      break;
    }
    case 'hills': {
      const hillCount = Math.floor(rr(2, 5));
      for (let i = 0; i < hillCount; i++) {
        items.push({ type: 'arc', x: rp(), y: rp(), params: { radiusX: rr(10, 18), radiusY: rr(5, 9) }, color: '#4a5a3a', opacity: rr(0.2, 0.3) });
      }
      const boulderCount = Math.floor(rr(1, 3));
      for (let i = 0; i < boulderCount; i++) {
        items.push({ type: 'ellipse', x: rp(), y: rp(), params: { rx: rr(3, 6), ry: rr(2, 4) }, color: '#3a4a2a', opacity: 0.4 });
      }
      break;
    }
    case 'coast': {
      const waveCount = Math.floor(rr(2, 4));
      for (let i = 0; i < waveCount; i++) {
        items.push({ type: 'wave', x: rp(), y: rp(), params: { amplitude: rr(2, 4), width: rr(15, 25) }, color: '#1a5a4a', opacity: 0.3 });
      }
      break;
    }
    case 'plains': {
      const vegCount = Math.floor(rr(3, 6));
      for (let i = 0; i < vegCount; i++) {
        items.push({ type: 'circle', x: rp(), y: rp(), params: { r: rr(2, 5) }, color: '#2a6a1a', opacity: rr(0.2, 0.3) });
      }
      const farmCount = Math.floor(rr(1, 3));
      for (let i = 0; i < farmCount; i++) {
        const w = rr(10, 20);
        const h = rr(6, 12);
        items.push({ type: 'rect', x: rp(), y: rp(), params: { width: w, height: h }, color: '#4a7a30', opacity: 0.15 });
      }
      break;
    }
    default:
      break;
  }

  // Offset all items by centroid (make them world-space)
  for (const item of items) {
    item.x += centroid.x;
    item.y += centroid.y;
  }

  return items;
}

// =============================================================================
// DIVINE DOMINION — Camera Controller Pure Helpers (no Phaser dependency)
// =============================================================================

import { CAMERA, ZOOM_LEVELS } from './palettes.js';

/** Clamp zoom to [ZOOM_MIN, ZOOM_MAX]. */
export function clampZoom(zoom: number): number {
  return Math.max(CAMERA.ZOOM_MIN, Math.min(CAMERA.ZOOM_MAX, zoom));
}

/** Determine zoom level tier from zoom value. */
export type ZoomTier = 'strategic' | 'regional' | 'closeup';

export function getZoomTier(zoom: number): ZoomTier {
  if (zoom < ZOOM_LEVELS.STRATEGIC.max) return 'strategic';
  if (zoom < ZOOM_LEVELS.REGIONAL.max)  return 'regional';
  return 'closeup';
}

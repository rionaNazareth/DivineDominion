// =============================================================================
// DIVINE DOMINION — Trade Renderer Pure Helpers (no Phaser dependency)
// =============================================================================

import type { TradeRoute } from '../types/game.js';
import { COLORS } from './palettes.js';

/** Map trade volume (0–1) to line thickness (1.5–5px). */
export function volumeToLineWidth(volume: number): number {
  return 1.5 + volume * 3.5;
}

/** Determine draw color for a trade route. */
export function tradeRouteColor(route: TradeRoute): { hex: string; alpha: number; dashed: boolean } {
  if (!route.isActive || (route.disruptedUntilYear !== undefined && route.disruptedUntilYear > 0)) {
    return { hex: COLORS.DANGER, alpha: 0.4, dashed: true };
  }
  return { hex: COLORS.PRIMARY, alpha: 0.7, dashed: false };
}

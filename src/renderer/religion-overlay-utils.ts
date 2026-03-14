// =============================================================================
// DIVINE DOMINION — Religion Overlay Pure Helpers (no Phaser dependency)
// =============================================================================

import type { ReligionInfluence } from '../types/game.js';
import { getReligionColor } from './palettes.js';

/** Find the dominant religion (highest influence) in a region, or null. */
export function getDominantReligion(influences: ReligionInfluence[]): ReligionInfluence | null {
  if (influences.length === 0) return null;
  return influences.reduce((best, cur) => cur.strength > best.strength ? cur : best);
}

/** Whether a religion has a majority (>= 60% dominance threshold). */
export function hasMajority(influences: ReligionInfluence[]): boolean {
  const dom = getDominantReligion(influences);
  return dom !== null && dom.strength >= 0.60;
}

/** Whether the given religion has a stronghold (>= 80%). */
export function hasStronghold(influences: ReligionInfluence[], religionId: string): boolean {
  const rel = influences.find(i => i.religionId === religionId);
  return rel !== null && rel !== undefined && rel.strength >= 0.80;
}

export interface ArcSegment {
  startAngleDeg: number;
  sweepDeg: number;
  color: string;
  opacity: number;
}

/**
 * Compute arc segments (start angle, sweep, color) for contested regions.
 * Proportional to each religion's share. At most 3 segments (top 3 by strength).
 */
export function computeContestArcSegments(influences: ReligionInfluence[]): ArcSegment[] {
  const top = influences
    .filter(i => i.strength > 0)
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 3);

  if (top.length === 0) return [];

  const total = top.reduce((s, i) => s + i.strength, 0);
  const segments: ArcSegment[] = [];
  let angle = 0;

  for (const inf of top) {
    const sweep = (inf.strength / total) * 360;
    const { hex } = getReligionColor(inf.religionId);
    segments.push({ startAngleDeg: angle, sweepDeg: sweep, color: hex, opacity: 0.7 });
    angle += sweep;
  }

  return segments;
}

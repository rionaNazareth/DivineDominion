// =============================================================================
// DIVINE DOMINION — Army Renderer Pure Helpers (no Phaser dependency)
// =============================================================================

/** Format troop count as "5K", "12K", "1.2M" etc. */
export function formatTroopCount(strength: number): string {
  if (strength >= 1_000_000) return `${(strength / 1_000_000).toFixed(1)}M`;
  if (strength >= 1_000)     return `${Math.round(strength / 1_000)}K`;
  return String(strength);
}

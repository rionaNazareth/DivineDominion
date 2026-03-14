// =============================================================================
// DIVINE DOMINION — Renderer Pure-Logic Tests (Phase 2)
// Tests all exported pure helpers from renderer modules.
// Phaser-dependent scene classes are NOT tested here (require browser/WebGL).
// =============================================================================

import { describe, it, expect } from 'vitest';

// palettes (no Phaser dependency)
import {
  TERRAIN_COLORS, ERA_COLORS, RELIGION_COLORS, POWER_VFX,
  WHISPER_VFX, HARBINGER_VFX, CAMERA, ZOOM_LEVELS,
  getReligionColor,
} from '../palettes.js';

// map-utils (pure helpers, no Phaser)
import { devToCityLevel, computeCentroid, estimateRegionWidth } from '../map-utils.js';

// religion-overlay pure helpers only
import { getDominantReligion, hasMajority, hasStronghold, computeContestArcSegments } from '../religion-overlay-utils.js';

// army-renderer pure helpers only
import { formatTroopCount } from '../army-utils.js';

// trade-renderer pure helpers only
import { volumeToLineWidth, tradeRouteColor } from '../trade-utils.js';

// disease-overlay pure helpers only
import { getDiseaseAlpha } from '../disease-utils.js';

// era-transition pure helpers only
import { eraIndex, eraName } from '../era-utils.js';

// camera-controller pure helpers only
import { clampZoom, getZoomTier } from '../camera-utils.js';

// terrain-detail (no Phaser dependency)
import { generateMicroDetail } from '../terrain-detail.js';

// =============================================================================
// RND-001 to RND-010 — Palettes
// =============================================================================

describe('RND-001 Terrain palette completeness', () => {
  it('all 8 terrain types have color entries', () => {
    const terrains = ['plains', 'forest', 'desert', 'hills', 'tundra', 'mountain', 'coast', 'ocean'] as const;
    for (const t of terrains) {
      expect(TERRAIN_COLORS[t]).toBeDefined();
      expect(TERRAIN_COLORS[t].gradientCenter).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(TERRAIN_COLORS[t].gradientEdge).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});

describe('RND-002 Era palette completeness', () => {
  it('all 12 eras have color entries', () => {
    const eras = ['renaissance', 'exploration', 'enlightenment', 'revolution', 'industry', 'empire', 'atomic', 'digital', 'signal', 'revelation', 'preparation', 'arrival'] as const;
    for (const e of eras) {
      expect(ERA_COLORS[e]).toBeDefined();
      expect(ERA_COLORS[e].primary).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(ERA_COLORS[e].secondary).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});

describe('RND-003 Religion palette completeness', () => {
  it('all 11 religion IDs have color entries', () => {
    const ids = ['player', 'flame', 'harvest', 'deep', 'endings', 'unity', 'fortress', 'covenant', 'wandering', 'veil', 'iron'];
    for (const id of ids) {
      expect(RELIGION_COLORS[id]).toBeDefined();
      expect(RELIGION_COLORS[id].hex).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(RELIGION_COLORS[id].overlayOpacity).toBeGreaterThan(0);
      expect(RELIGION_COLORS[id].overlayOpacity).toBeLessThanOrEqual(1);
    }
  });
});

describe('RND-004 getReligionColor fallback', () => {
  it('returns default gold for unknown religion', () => {
    const result = getReligionColor('unknown_religion_xyz');
    expect(result.hex).toBe('#c9a84c');
    expect(result.overlayOpacity).toBeGreaterThan(0);
  });
});

describe('RND-005 All 12 divine power VFX defined', () => {
  it('each power has required fields', () => {
    const powers = ['bountiful_harvest', 'inspiration', 'miracle', 'prophet', 'shield_of_faith', 'golden_age', 'earthquake', 'great_flood', 'plague', 'great_storm', 'famine', 'wildfire'];
    for (const p of powers) {
      expect(POWER_VFX[p]).toBeDefined();
      expect(POWER_VFX[p].particleColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(POWER_VFX[p].durationMs).toBeGreaterThan(0);
    }
  });
});

describe('RND-006 Whisper VFX for all 4 types', () => {
  it('each whisper type has color and duration', () => {
    const types = ['war', 'peace', 'science', 'faith'] as const;
    for (const t of types) {
      expect(WHISPER_VFX[t].color).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(WHISPER_VFX[t].durationMs).toBeGreaterThan(0);
    }
  });
});

describe('RND-007 Harbinger VFX defined', () => {
  it('all 8 harbinger VFX entries defined', () => {
    const keys = ['corruption', 'veil', 'discord', 'sever', 'false_miracle', 'plague_seed', 'divine_purge', 'anomaly'] as const;
    for (const k of keys) {
      expect(HARBINGER_VFX[k]).toBeDefined();
    }
  });
});

describe('RND-008 Camera constants valid', () => {
  it('zoom min < max, default within range', () => {
    expect(CAMERA.ZOOM_MIN).toBeLessThan(CAMERA.ZOOM_MAX);
    expect(CAMERA.ZOOM_DEFAULT).toBeGreaterThanOrEqual(CAMERA.ZOOM_MIN);
    expect(CAMERA.ZOOM_DEFAULT).toBeLessThanOrEqual(CAMERA.ZOOM_MAX);
  });
});

// =============================================================================
// RND-010 to RND-020 — Map Renderer helpers
// =============================================================================

describe('RND-010 devToCityLevel', () => {
  it('dev 1-2 → level 1', () => {
    expect(devToCityLevel(1)).toBe(1);
    expect(devToCityLevel(2)).toBe(1);
  });
  it('dev 3-4 → level 2', () => {
    expect(devToCityLevel(3)).toBe(2);
    expect(devToCityLevel(4)).toBe(2);
  });
  it('dev 5-7 → level 3', () => {
    expect(devToCityLevel(5)).toBe(3);
    expect(devToCityLevel(7)).toBe(3);
  });
  it('dev 8-10 → level 4', () => {
    expect(devToCityLevel(8)).toBe(4);
    expect(devToCityLevel(10)).toBe(4);
  });
  it('dev 11-12 → level 5', () => {
    expect(devToCityLevel(11)).toBe(5);
    expect(devToCityLevel(12)).toBe(5);
  });
});

describe('RND-011 computeCentroid', () => {
  it('centroid of unit square is (0.5, 0.5)', () => {
    const verts = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }];
    const c = computeCentroid(verts);
    expect(c.x).toBeCloseTo(0.5);
    expect(c.y).toBeCloseTo(0.5);
  });
  it('empty vertices returns (0,0)', () => {
    expect(computeCentroid([])).toEqual({ x: 0, y: 0 });
  });
  it('single point returns that point', () => {
    expect(computeCentroid([{ x: 5, y: 7 }])).toEqual({ x: 5, y: 7 });
  });
});

describe('RND-012 estimateRegionWidth', () => {
  it('returns avg of bounding box dimensions', () => {
    const verts = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 6 }, { x: 0, y: 6 }];
    // (10 + 6) / 2 = 8
    expect(estimateRegionWidth(verts)).toBeCloseTo(8);
  });
  it('empty vertices returns fallback 50', () => {
    expect(estimateRegionWidth([])).toBe(50);
  });
});

// =============================================================================
// RND-020 to RND-030 — Religion Overlay helpers
// =============================================================================

describe('RND-020 getDominantReligion', () => {
  it('returns religion with highest strength', () => {
    const influences = [
      { religionId: 'flame', strength: 0.3 },
      { religionId: 'player', strength: 0.6 },
      { religionId: 'harvest', strength: 0.1 },
    ];
    expect(getDominantReligion(influences)?.religionId).toBe('player');
  });
  it('returns null for empty array', () => {
    expect(getDominantReligion([])).toBeNull();
  });
});

describe('RND-021 hasMajority', () => {
  it('returns true when dominant religion >= 60%', () => {
    const influences = [{ religionId: 'player', strength: 0.65 }];
    expect(hasMajority(influences)).toBe(true);
  });
  it('returns false when below 60%', () => {
    const influences = [
      { religionId: 'player', strength: 0.55 },
      { religionId: 'flame',  strength: 0.45 },
    ];
    expect(hasMajority(influences)).toBe(false);
  });
  it('exactly 60% is a majority', () => {
    expect(hasMajority([{ religionId: 'x', strength: 0.60 }])).toBe(true);
  });
});

describe('RND-022 hasStronghold', () => {
  it('returns true when religion strength >= 80%', () => {
    const influences = [{ religionId: 'player', strength: 0.85 }];
    expect(hasStronghold(influences, 'player')).toBe(true);
  });
  it('returns false when below 80%', () => {
    expect(hasStronghold([{ religionId: 'player', strength: 0.75 }], 'player')).toBe(false);
  });
  it('returns false for absent religion', () => {
    expect(hasStronghold([{ religionId: 'flame', strength: 0.90 }], 'player')).toBe(false);
  });
});

describe('RND-023 computeContestArcSegments', () => {
  it('proportional arc segments sum to 360 degrees', () => {
    const influences = [
      { religionId: 'flame',  strength: 0.4 },
      { religionId: 'player', strength: 0.35 },
      { religionId: 'harvest',strength: 0.25 },
    ];
    const segments = computeContestArcSegments(influences);
    const total = segments.reduce((s, seg) => s + seg.sweepDeg, 0);
    expect(total).toBeCloseTo(360, 1);
  });
  it('returns empty for empty influences', () => {
    expect(computeContestArcSegments([])).toHaveLength(0);
  });
  it('at most 3 segments (top 3 by strength)', () => {
    const influences = Array.from({ length: 6 }, (_, i) => ({ religionId: `rel-${i}`, strength: 0.1 + i * 0.05 }));
    expect(computeContestArcSegments(influences).length).toBeLessThanOrEqual(3);
  });
});

// =============================================================================
// RND-030 to RND-035 — Army Renderer helpers
// =============================================================================

describe('RND-030 formatTroopCount', () => {
  it('below 1000 → plain string', () => {
    expect(formatTroopCount(750)).toBe('750');
  });
  it('1000+ → K notation', () => {
    expect(formatTroopCount(5000)).toBe('5K');
    expect(formatTroopCount(12500)).toBe('13K');
  });
  it('1M+ → M notation', () => {
    expect(formatTroopCount(1_500_000)).toBe('1.5M');
  });
  it('boundary: exactly 1000 → 1K', () => {
    expect(formatTroopCount(1000)).toBe('1K');
  });
});

// =============================================================================
// RND-040 to RND-045 — Trade Renderer helpers
// =============================================================================

describe('RND-040 volumeToLineWidth', () => {
  it('volume 0 → 1.5px', () => {
    expect(volumeToLineWidth(0)).toBeCloseTo(1.5);
  });
  it('volume 1 → 5px', () => {
    expect(volumeToLineWidth(1)).toBeCloseTo(5.0);
  });
  it('volume 0.5 → midpoint', () => {
    expect(volumeToLineWidth(0.5)).toBeCloseTo(3.25);
  });
});

describe('RND-041 tradeRouteColor', () => {
  it('active undisrupted → gold, not dashed', () => {
    const route = { id: 'r1', regionA: 'a', regionB: 'b', distance: 1, volume: 0.5, isActive: true };
    const result = tradeRouteColor(route as any);
    expect(result.dashed).toBe(false);
    expect(result.hex).toBe('#c9a84c');
  });
  it('disrupted → red, dashed', () => {
    const route = { id: 'r2', regionA: 'a', regionB: 'b', distance: 1, volume: 0.5, isActive: false };
    const result = tradeRouteColor(route as any);
    expect(result.dashed).toBe(true);
  });
  it('active but disrupted until future year → red, dashed', () => {
    const route = { id: 'r3', regionA: 'a', regionB: 'b', distance: 1, volume: 0.5, isActive: true, disruptedUntilYear: 1900 };
    const result = tradeRouteColor(route as any);
    expect(result.dashed).toBe(true);
  });
});

// =============================================================================
// RND-050 — Disease Overlay helpers
// =============================================================================

describe('RND-050 getDiseaseAlpha', () => {
  it('returns 0 for non-affected region', () => {
    const disease: any = { affectedRegions: ['r1'], severity: 'mild' };
    expect(getDiseaseAlpha(disease, 'r2')).toBe(0);
  });
  it('mild disease returns low alpha', () => {
    const disease: any = { affectedRegions: ['r1'], severity: 'mild' };
    const alpha = getDiseaseAlpha(disease, 'r1');
    expect(alpha).toBeGreaterThan(0);
    expect(alpha).toBeLessThan(0.5);
  });
  it('pandemic returns higher alpha than mild', () => {
    const mild: any = { affectedRegions: ['r1'], severity: 'mild' };
    const pandemic: any = { affectedRegions: ['r1'], severity: 'pandemic' };
    expect(getDiseaseAlpha(pandemic, 'r1')).toBeGreaterThan(getDiseaseAlpha(mild, 'r1'));
  });
});

// =============================================================================
// RND-060 to RND-065 — Era Transition helpers
// =============================================================================

describe('RND-060 eraIndex', () => {
  it('renaissance is 0', () => {
    expect(eraIndex('renaissance')).toBe(0);
  });
  it('arrival is 11', () => {
    expect(eraIndex('arrival')).toBe(11);
  });
  it('all 12 eras have sequential indices', () => {
    const eras = ['renaissance', 'exploration', 'enlightenment', 'revolution', 'industry', 'empire', 'atomic', 'digital', 'signal', 'revelation', 'preparation', 'arrival'] as const;
    eras.forEach((e, i) => expect(eraIndex(e)).toBe(i));
  });
});

describe('RND-061 eraName', () => {
  it('returns human-readable name', () => {
    expect(eraName('renaissance')).toBe('Renaissance');
    expect(eraName('arrival')).toBe('Arrival');
  });
  it('all 12 eras return non-empty names', () => {
    const eras = ['renaissance', 'exploration', 'enlightenment', 'revolution', 'industry', 'empire', 'atomic', 'digital', 'signal', 'revelation', 'preparation', 'arrival'] as const;
    for (const e of eras) {
      expect(eraName(e).length).toBeGreaterThan(0);
    }
  });
});

// =============================================================================
// RND-070 to RND-075 — Camera Controller helpers
// =============================================================================

describe('RND-070 clampZoom', () => {
  it('clamps below min to min', () => {
    expect(clampZoom(0.01)).toBe(CAMERA.ZOOM_MIN);
  });
  it('clamps above max to max', () => {
    expect(clampZoom(999)).toBe(CAMERA.ZOOM_MAX);
  });
  it('passes through valid zoom unchanged', () => {
    expect(clampZoom(1.0)).toBe(1.0);
  });
});

describe('RND-071 getZoomTier', () => {
  it('low zoom → strategic', () => {
    expect(getZoomTier(0.5)).toBe('strategic');
  });
  it('mid zoom → regional', () => {
    expect(getZoomTier(1.0)).toBe('regional');
  });
  it('high zoom → closeup', () => {
    expect(getZoomTier(2.5)).toBe('closeup');
  });
});

// =============================================================================
// RND-080 to RND-085 — Terrain Detail
// =============================================================================

describe('RND-080 generateMicroDetail — output structure', () => {
  const centroid = { x: 500, y: 300 };
  const regionWidth = 80;

  it('forest generates circle items', () => {
    const items = generateMicroDetail('forest', centroid, 12345, regionWidth);
    expect(items.length).toBeGreaterThan(0);
    expect(items.every(i => typeof i.x === 'number' && typeof i.y === 'number')).toBe(true);
  });

  it('ocean generates no items', () => {
    const items = generateMicroDetail('ocean', centroid, 12345, regionWidth);
    expect(items.length).toBe(0);
  });

  it('items have opacity in [0,1]', () => {
    const items = generateMicroDetail('plains', centroid, 99, regionWidth);
    for (const item of items) {
      expect(item.opacity).toBeGreaterThanOrEqual(0);
      expect(item.opacity).toBeLessThanOrEqual(1);
    }
  });

  it('items have valid hex color', () => {
    const items = generateMicroDetail('desert', centroid, 42, regionWidth);
    for (const item of items) {
      expect(item.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it('same seed → same result (deterministic)', () => {
    const a = generateMicroDetail('mountain', centroid, 777, regionWidth);
    const b = generateMicroDetail('mountain', centroid, 777, regionWidth);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('different seeds → different results', () => {
    const a = generateMicroDetail('hills', centroid, 1, regionWidth);
    const b = generateMicroDetail('hills', centroid, 2, regionWidth);
    // Very unlikely to be identical
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(b));
  });
});
